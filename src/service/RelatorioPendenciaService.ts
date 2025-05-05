import mongoose from "mongoose"
import HTTPError from "../utils/error"
import path from "path"
import PdfPrinter from "pdfmake"
import { Content, TDocumentDefinitions } from "pdfmake/interfaces"
import { DataUtils } from "../utils/dataUtils"
import {
  buscaDeclaracao,
  formatarDadosRecibo,
  MapeadorCamposPercentual
} from "./utilsDocuments"
import { DeclaracaoModel, IMuseu, IUsuario } from "../models"
import { AnoDeclaracaoModel } from "../models/AnoDeclaracao"
import minioClient from "../db/minioClient"
import {uploadRelatorioPendenciasToMinio, verificarRelatorioExistente } from "../utils/minioUtil"
import { chain } from 'stream-chain';
import { parser } from 'stream-json';
import { streamArray } from 'stream-json/streamers/StreamArray';
import { pick } from 'stream-json/filters/Pick';



export const getDetailedErrorsStreamed = async (
  declaracaoId: string,
  tipoArquivo: string
): Promise<{ linha: number; camposComErro: string[] }[]> => {
  const fileName = `detalhes-${declaracaoId}-${tipoArquivo}.json`;
  const objectPath = `detalhes/${declaracaoId}/${tipoArquivo}/${fileName}`;
  console.log("[MinIO] Iniciando leitura do arquivo stream:", objectPath);

  const resultados: { linha: number; camposComErro: string[] }[] = [];

  try {
    const stream = await minioClient.getObject("inbcm", objectPath);
    console.log("[MinIO] Stream recebido com sucesso do MinIO.");

    const pipeline = chain([
      stream,
      parser(),
      (data) => {
        console.log("[MinIO][Etapa:parser] Token recebido:", data);
        return data;
      },
      pick({ filter: 'detailedErrors' }),
      (data) => {
        console.log("[MinIO][Etapa:pick] detailedErrors encontrado:", data);
        return data;
      },
      streamArray(),
      (data) => {
        console.log("[MinIO][Etapa:streamArray] Item processado:", data.value);
        resultados.push(data.value);
      }
    ]);

    pipeline.on('data', () => {}); // necessário para o pipeline rodar
    await new Promise<void>((resolve, reject) => {
      pipeline.on('end', () => {
        console.log("[MinIO] Pipeline finalizado com sucesso.");
        resolve();
      });
      pipeline.on('error', (err) => {
        console.error("[MinIO] Erro no pipeline:", err);
        reject(err);
      });
    });

    console.log(`[MinIO] Total de registros processados: ${resultados.length}`);
    return resultados;
  } catch (error) {
    console.error("[MinIO] Erro geral ao processar JSON grande:", error);
    throw error;
  }
};


const corrigirOrtografia: Record<string, string> = {
  museologico: "museológico",
  arquivistico: "arquivístico",
  bibliografico: "bibliográfico"
}

const gerarTabelaPendencias = (
  tipo: "museologico" | "bibliografico" | "arquivistico",
  detailedErrors: { linha: number, camposComErro: string[] }[],
) => {
  // Mapeador de campos para o tipo do acervo
  const campos = MapeadorCamposPercentual[tipo];
  
  // Corrigir o tipo do acervo para exibição na tabela
  const tipoCorrigido = corrigirOrtografia[tipo] || tipo;

  // Se não há erros, retorna uma tabela informando que não há pendências
  if (detailedErrors.length === 0) {
    return {
      table: {
        widths: ["100%"],
        body: [
          [
            {
              text: `Não há pendências para o acervo ${tipoCorrigido}`,
              style: "tableHeader",
              fillColor: "#D9D9D9",
              alignment: "center"
            }
          ]
        ]
      },
      layout: {
        fillColor: (rowIndex: number) =>
          rowIndex % 2 === 0 ? "#F5F5F5" : null,
        paddingLeft: () => 10,
        paddingRight: () => 10,
        paddingTop: () => 5,
        paddingBottom: () => 5
      }
    };
  }

  // Ordenando os erros pela linha e tratando valores nulos em camposComErro
  const errosOrdenados = detailedErrors
    .map((erro) => ({
      ...erro,
      linha: erro.linha + 1, // Incrementa 1 na linha para ajustar a numeração
      camposComErro: erro.camposComErro ?? [] // Garantir que camposComErro nunca seja nulo ou undefined
    }))
    .sort((a, b) => a.linha - b.linha); // Ordena por linha

  // Montando o corpo da tabela com os erros
  return {
    table: {
      widths: ["10%", "50%", "40%"], // Definindo larguras das colunas
      body: [
        [
          {
            text: `Pendências do acervo ${tipoCorrigido}`,
            style: "tableHeader",
            fillColor: "#D9D9D9",
            colSpan: 3
          },
          {},
          {}
        ],
        [
          { text: "Linha", style: "tableHeader", alignment: "center" },
          { text: "Campo", style: "tableHeader", alignment: "center" },
          { text: "Descrição", style: "tableHeader", alignment: "center" }
        ],
        // Preenchendo a tabela com os erros
        ...errosOrdenados.flatMap((erro) =>
          erro.camposComErro.map((campo) => {
            if (campo === "Não localizado") {
              return [
                {
                  text: `${erro.linha}`,
                  style: "tableData",
                  alignment: "center"
                },
                {
                  text: "Situação",
                  style: "tableData",
                  alignment: "left",
                  noWrap: true
                },
                {
                  text: "Item não localizado",
                  style: "tableData",
                  alignment: "left",
                  noWrap: true
                }
              ];
            } else {
              const campoKey = campo as keyof typeof campos;
              return [
                {
                  text: `${erro.linha}`,
                  style: "tableData",
                  alignment: "center"
                },
                {
                  text: campos[campoKey] || campo,
                  style: "tableData",
                  alignment: "left",
                  noWrap: true
                },
                {
                  text: "Campo vazio", // Adapte conforme necessário para exibir a descrição correta
                  style: "tableData",
                  alignment: "left",
                  noWrap: true
                }
              ];
            }
          })
        )
      ]
    },
    layout: {
      fillColor: (rowIndex: number) =>
        rowIndex % 2 === 0 ? "#F5F5F5" : null,
      paddingLeft: () => 10,
      paddingRight: () => 10,
      paddingTop: () => 5,
      paddingBottom: () => 5
    }
  };
};


/**
 * Gera o PDF do recibo com base no ID da declaração.
 *
 * @param declaracaoId - O ID da declaração para a qual gerar o recibo.
 * @returns Uma promessa que resolve com o buffer do PDF do recibo gerado.
 * @throws Um erro se houver algum problema ao gerar o recibo.
 */
export async function gerarPDFRelatorioPendenciais(
  declaracaoId: mongoose.Types.ObjectId
):Promise<string> {
  const fonts = {
    Roboto: {
      normal: path.resolve("fonts/Roboto-Regular.ttf"),
      bold: path.resolve("fonts/Roboto-Medium.ttf"),
      italics: path.resolve("fonts/Roboto-Italic.ttf"),
      bolditalics: path.resolve("fonts/Roboto-MediumItalic.ttf")
    }
  }
  const printer = new PdfPrinter(fonts)
  const relatorioExistente = await verificarRelatorioExistente(
     declaracaoId.toHexString()
)

  if (relatorioExistente) {
    return relatorioExistente
  }
  try {
    const declaracao = (await buscaDeclaracao(
      declaracaoId
    )) as unknown as DeclaracaoModel & {
      museu_id: IMuseu & { usuario: IUsuario }
      anoDeclaracao: AnoDeclaracaoModel
    }
    console.log("[MinIO] Buscando erros com:");
    console.log(" - declaracaoId:", declaracaoId.toString());
    console.log(" - tipoArquivo:", "museologico");
    let errosMuseologico: any[] = []
    let errosBibliografico: any[] = []
    let errosArquivistico: any[] = []
    
    try {
      const resultadoMuseologico = await getDetailedErrorsStreamed(declaracaoId.toString(), "museologico");
      console.log("[MinIO] Resultado museológico:", resultadoMuseologico);
      errosMuseologico = Array.isArray(resultadoMuseologico) ? resultadoMuseologico : [];
    } catch (error) {
      console.warn("[MinIO] Arquivo museológico não encontrado:", error);
    }
    
    try {
      const resultadoBibliografico = await getDetailedErrorsStreamed(declaracaoId.toString(), "bibliografico");
      console.log("[MinIO] Resultado bibliográfico:", resultadoBibliografico);
      errosBibliografico = Array.isArray(resultadoBibliografico) ? resultadoBibliografico : [];
    } catch (error) {
      console.warn("[MinIO] Arquivo bibliográfico não encontrado:", error);
    }
    
    try {
      const resultadoArquivistico = await getDetailedErrorsStreamed(declaracaoId.toString(), "arquivistico");
      console.log("[MinIO] Resultado arquivístico:", resultadoArquivistico);
      errosArquivistico = Array.isArray(resultadoArquivistico) ? resultadoArquivistico : [];
    } catch (error) {
      console.warn("[MinIO] Arquivo arquivístico não encontrado:", error);
    }
    

    // Gerar tabelas de pendências usando os erros recuperados
    console.log("[PDF] Gerando tabela para museológico com", errosMuseologico.length, "erros")
      const tabelaMuseologico = declaracao.museologico
    ? gerarTabelaPendencias("museologico", errosMuseologico)
    : undefined

    const tabelaBibliografico = declaracao.bibliografico
      ? gerarTabelaPendencias("bibliografico", errosBibliografico)
      : undefined

    const tabelaArquivistico = declaracao.arquivistico
      ? gerarTabelaPendencias("arquivistico", errosArquivistico)
      : undefined

    const conteudo: Content[] = []

    // Adiciona tabela Museológica, se existir
    if (tabelaMuseologico) conteudo.push(tabelaMuseologico)

    // Adiciona tabela Bibliográfica, se existir, com quebra de página ANTES dela
    if (tabelaBibliografico) {
      if (conteudo.length > 0)
        conteudo.push({ text: "\n\n", pageBreak: "before" })
      conteudo.push(tabelaBibliografico)
    }

    // Adiciona tabela Arquivística, se existir, com quebra de página ANTES dela
    if (tabelaArquivistico) {
      if (conteudo.length > 0)
        conteudo.push({ text: "\n\n", pageBreak: "before" })
      conteudo.push(tabelaArquivistico)
    }
    const dadosFormatados = formatarDadosRecibo(declaracao)

    const docDefinition: TDocumentDefinitions = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],
      footer: function (currentPage, pageCount) {
        const tipoDeclaracao = declaracao.retificacao
          ? "retificadora"
          : "original"

        return {
          columns: [
            {
              text:
                declaracao.museu_id.nome +
                "\nDeclaração " +
                tipoDeclaracao +
                " referente ao ano " +
                declaracao.anoDeclaracao.ano +
                "\nApresentada em " +
                DataUtils.gerarDataFormatada(declaracao.dataRecebimento) +
                ", às " +
                DataUtils.gerarHoraFormatada(declaracao.dataRecebimento),
              alignment: "left",
              fontSize: 10,
              width: "80%"
            },
            {
              text: currentPage + " de " + pageCount,
              alignment: "right",
              fontSize: 10,
              width: "20%",
              margin: [0, 20, 0, 0]
            }
          ],
          margin: [40, 10, 40, 20]
        }
      },

      content: [
        {
          table: {
            widths: ["*"],
            body: [
              [
                {
                  columns: [
                    {
                      text: "INSTITUTO BRASILEIRO DE MUSEUS",
                      style: "headerLeft"
                    },
                    {
                      text: `ANO-CALENDÁRIO ${dadosFormatados.anoCalendario}`,
                      style: "headerRight"
                    }
                  ]
                }
              ]
            ]
          }
        },
        { text: "\n\n" },
        {
          text: "INVENTÁRIO NACIONAL DE BENS CULTURAIS MUSEALIZADOS\nRECIBO DE ENTREGA DE DECLARAÇÃO DE AJUSTE ANUAL\n",
          style: "title"
        },
        {
          text: `DECLARAÇÃO ${dadosFormatados.tipoDeclaracao}`,
          style: "title"
        },

        { text: "\n\n" },
        { text: "\n\n" },

        {
          table: {
            widths: ["33%", "67%"],
            body: [
              [
                {
                  text: "Situação da declaração",
                  bold: true,
                  fillColor: "#D9D9D9",
                  border: [true, true, true, true]
                },
                {
                  text: dadosFormatados.statusDeclaracao,
                  fillColor: "#FFFFFF",
                  color: "#000000",
                  border: [true, true, true, true]
                }
              ]
            ]
          },
          layout: {
            defaultBorder: true
          }
        },
        { text: "\n\n" },
        { text: "Identificação do declarante", style: "title" },
        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "*"],
            body: [
              [
                { text: "Código identificador IBRAM", style: "tableHeader" },
                { text: "Nome do museu", style: "tableHeader", colSpan: 2 },
                {}
              ],
              [
                dadosFormatados.codigoIdentificador,
                { text: dadosFormatados.nomeMuseu, colSpan: 2 },
                {}
              ],
              [
                { text: "Logradouro", style: "tableHeader" },
                { text: "Número", style: "tableHeader" },
                { text: "Complemento", style: "tableHeader" }
              ],
              [
                dadosFormatados.logradouro,
                dadosFormatados.numero,
                dadosFormatados.complemento!
              ],
              [
                { text: "Bairro", style: "tableHeader" },
                { text: "CEP", style: "tableHeader" },
                { text: "Município/UF", style: "tableHeader" }
              ],
              [
                dadosFormatados.bairro,
                dadosFormatados.cep,
                `${dadosFormatados.municipio}/${dadosFormatados.uf}`
              ]
            ]
          },
          layout: {
            fillColor: function (rowIndex: number) {
              return rowIndex % 2 === 0 ? "#CCCCCC" : null
            }
          }
        },
        {
          text: "\nBens declarados",
          style: "sectionHeader"
        },

        {
          table: {
            headerRows: 1,
            widths: ["*", "*", "*", "*"], // Colunas: Acervo, Quantidade de itens, Situação, Pendências
            body: [
              // Cabeçalho
              [
                {
                  text: "Acervo",
                  style: "tableHeader",
                  fillColor: "#D9D9D9",
                  alignment: "center"
                },
                {
                  text: "Quantidade de itens",
                  style: "tableHeader",
                  fillColor: "#D9D9D9",
                  alignment: "center"
                },
                {
                  text: "Situação",
                  style: "tableHeader",
                  fillColor: "#D9D9D9",
                  alignment: "center"
                },
                {
                  text: "Pendências",
                  style: "tableHeader",
                  fillColor: "#D9D9D9",
                  alignment: "center"
                }
              ],
              // Linha Museológico
              [
                { text: "Museológico", style: "tableData", alignment: "left" },
                {
                  text: dadosFormatados.bensMuseologicos || "0",
                  style: "tableData",
                  alignment: "right"
                },
                {
                  text: dadosFormatados.statusArquivoMuseologico,
                  style: "tableData",
                  alignment: "left"
                },
                {
                  text: dadosFormatados.pendenciaisArquivoMuseologico || "0",
                  style: "tableData",
                  alignment: "left"
                }
              ],
              // Linha Bibliográfico
              [
                {
                  text: "Bibliográfico",
                  style: "tableData",
                  alignment: "left"
                },
                {
                  text: dadosFormatados.bensBibliograficos || "0",
                  style: "tableData",
                  alignment: "right"
                },
                {
                  text: dadosFormatados.statusArquivoBibliografico,
                  style: "tableData",
                  alignment: "left"
                },
                {
                  text: dadosFormatados.pendenciaisArquivoBibliografico || "0",
                  style: "tableData",
                  alignment: "left"
                }
              ],

              [
                { text: "Arquivístico", style: "tableData", alignment: "left" },
                {
                  text: dadosFormatados.bensArquivisticos || "0",
                  style: "tableData",
                  alignment: "right"
                },
                {
                  text: dadosFormatados.statusArquivoArquivistico,
                  style: "tableData",
                  alignment: "left"
                },
                {
                  text: dadosFormatados.pendenciaisArquivoArquivisitico || "0",
                  style: "tableData",
                  alignment: "left"
                }
              ],

              [
                {
                  text: "TOTAL DE ITENS",
                  colSpan: 3,
                  style: "tableHeader",
                  bold: true,
                  alignment: "right"
                },
                {},
                {},
                {
                  text: dadosFormatados.totalBensDeclarados || "0",
                  style: "tableData",
                  bold: true,
                  alignment: "right",
                  fillColor: "#BFBFBF"
                }
              ]
            ]
          }
        },
        { text: "\n\n" },
        {
          text: `\nSr(a) ${dadosFormatados.nomeDeclarante},\n`,
          style: "footerText"
        },
        {
          text: `O NÚMERO DE RECIBO DE SUA DECLARAÇÃO APRESENTADO EM  ${dadosFormatados.data} às ${dadosFormatados.hora} é, \n`,
          style: "footerText"
        },
        { text: "\n\n" },
        { text: dadosFormatados.numeroRecibo, style: "footerReceipt" },
        { text: "\n\n\n\n\n\n\n\n" },
        {
          text: ` Recibo emitido em ${DataUtils.gerarDataFormatada()} às ${DataUtils.gerarHoraFormatada()}`,
          fontSize: 11
        },

        {
          text: "\n\n DETALHAMENTO DE PENDÊNCIAS DA DECLARAÇÃO",
          style: "sectionHeader"
        },
        { text: "\n\n" },

        ...conteudo
      ],

      styles: {
        headerLeft: {
          fontSize: 12,
          bold: true,
          alignment: "left"
        },
        headerRight: {
          fontSize: 12,
          bold: true,
          alignment: "right"
        },
        title: {
          fontSize: 14,
          bold: true,
          alignment: "center"
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: "black"
        },
        tableData: {
          fontSize: 12,
          alignment: "right"
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          alignment: "center"
        },
        subSectionHeader: {
          fontSize: 12,
          bold: true,
          alignment: "left"
        },
        footerText: {
          fontSize: 10,
          alignment: "left",
          color: "black"
        },
        footerReceipt: {
          fontSize: 10,
          bold: true,
          alignment: "center",
          color: "#000000"
        },
        pageNumber: {
          fontSize: 8,
          alignment: "right",
          margin: [0, 20, 20, 0]
        }
      }
    }
   
   
   

    return await new Promise<string>((resolve, reject) => {
      try {
        const pdfDoc = printer.createPdfKitDocument(docDefinition)
        const chunks: Buffer[] = []

        pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk))
        pdfDoc.on("end", async () => {
          const pdfBuffer = Buffer.concat(chunks)

          const fileName = `relatorio_pendencias_${declaracaoId}.pdf`
          const fileUrl = await uploadRelatorioPendenciasToMinio(fileName, pdfBuffer)

          resolve(fileUrl) 
        })

        pdfDoc.on("error", (err: Error) => {
          reject(new HTTPError(`Erro ao gerar PDF: ${err.message}`, 500))
        })

        pdfDoc.end()
      } catch (error) {
        reject(new HTTPError("Erro ao gerar o relatório de pendências.", 500))
      }
    })
  } catch (error) {
    console.log(error)
    throw new HTTPError("Erro ao montar o relatório de pendências.", 500)
  }
}
  



