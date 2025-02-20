import mongoose from "mongoose"
import HTTPError from "../utils/error"
import path from "path"
import PdfPrinter from "pdfmake"
import { TDocumentDefinitions } from "pdfmake/interfaces"
import { DataUtils } from "../utils/dataUtils"
import {
  buscaDeclaracao,
  buscaMuseu,
  buscaUsuario,
  formatarDadosRecibo,
  MapeadorCamposPercentual
} from "./utilsDocuments"
import { DeclaracaoModel } from "../models"

const gerarTabelaPendencias = (
  tipo: "museologico" | "bibliografico" | "arquivistico",
  declaracao: DeclaracaoModel
) => {
  const campos = MapeadorCamposPercentual[tipo]

  const erros = declaracao[tipo]?.detailedErrors || []

  if (erros.length === 0) {
    return {
      table: {
        widths: ["100%"],
        body: [
          [
            {
              text: `Não há pendências para o acervo ${tipo.charAt(0).toLowerCase() + tipo.slice(1)}`,
              style: "tableHeader",
              fillColor: "#D9D9D9",
              alignment: "center"
            }
          ]
        ]
      },
      layout: {
        fillColor: function (rowIndex: number) {
          return rowIndex % 2 === 0 ? "#F5F5F5" : null
        },
        paddingLeft: () => 10,
        paddingRight: () => 10,
        paddingTop: () => 5,
        paddingBottom: () => 5
      }
    }
  }

  const errosOrdenados = erros.sort((a, b) => a.linha - b.linha)

  return {
    table: {
      widths: ["10%", "50%", "40%"],
      body: [
        [
          {
            text: `Pendências do acervo ${tipo.charAt(0).toLowerCase() + tipo.slice(1)}`,
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
        ...errosOrdenados.flatMap((erro) => {
          return erro.camposComErro.map((campo) => {
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
                  text: "Ítem não localizado",
                  style: "tableData",
                  alignment: "center",
                  noWrap: true
                }
              ]
            } else {
              return [
                {
                  text: `${erro.linha}`,
                  style: "tableData",
                  alignment: "center"
                },
                {
                  text: campos[campo] || campo,
                  style: "tableData",
                  alignment: "left",
                  noWrap: true
                },
                {
                  text: "Campo vazio",
                  style: "tableData",
                  alignment: "center",
                  noWrap: true
                }
              ]
            }
          })
        })
      ]
    },
    layout: {
      fillColor: function (rowIndex: number) {
        return rowIndex % 2 === 0 ? "#F5F5F5" : null
      },
      paddingLeft: () => 10,
      paddingRight: () => 10,
      paddingTop: () => 5,
      paddingBottom: () => 5
    }
  }
}

/**
 * Gera o PDF do recibo com base no ID da declaração.
 *
 * @param declaracaoId - O ID da declaração para a qual gerar o recibo.
 * @returns Uma promessa que resolve com o buffer do PDF do recibo gerado.
 * @throws Um erro se houver algum problema ao gerar o recibo.
 */
export async function gerarPDFRelatorioPendenciais(
  declaracaoId: mongoose.Types.ObjectId
): Promise<Buffer> {
  const fonts = {
    Roboto: {
      normal: path.resolve("fonts/Roboto-Regular.ttf"),
      bold: path.resolve("fonts/Roboto-Medium.ttf"),
      italics: path.resolve("fonts/Roboto-Italic.ttf"),
      bolditalics: path.resolve("fonts/Roboto-MediumItalic.ttf")
    }
  }
  const printer = new PdfPrinter(fonts)

  try {
    const declaracao = await buscaDeclaracao(declaracaoId)
    const museu = await buscaMuseu(declaracao.museu_id)
    const usuario = await buscaUsuario(museu.usuario)
    const tabelaMuseologico = declaracao.museologico
      ? gerarTabelaPendencias("museologico", declaracao)
      : undefined

    const tabelaBibliografico = declaracao.bibliografico
      ? gerarTabelaPendencias("bibliografico", declaracao)
      : undefined

    const tabelaArquivistico = declaracao.arquivistico
      ? gerarTabelaPendencias("arquivistico", declaracao)
      : undefined

    const conteudo: any[] = []

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

    const dadosFormatados = formatarDadosRecibo(declaracao, museu, usuario)

    const docDefinition: TDocumentDefinitions = {
      pageSize: "A4",
      pageMargins: [40, 60, 40, 60],

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
                  fillColor: "#F5F5F5",
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
                  colSpan: 1,
                  style: "tableHeader",
                  bold: true,
                  alignment: "left"
                },
                {
                  text: dadosFormatados.totalBensDeclarados || "0",
                  style: "tableData",
                  bold: true,
                  alignment: "right"
                },
                {
                  text: "",
                  style: "tableData",
                  border: [false, true, false, true],
                  fillColor: "#BFBFBF"
                },
                {
                  text: "",
                  style: "tableData",
                  border: [false, true, true, true],
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

    return new Promise<Buffer>((resolve, reject) => {
      const pdfDoc = printer.createPdfKitDocument(docDefinition)
      const chunks: Buffer[] = []

      pdfDoc.on("data", (chunk: Buffer) => chunks.push(chunk))
      pdfDoc.on("end", () => {
        const result = Buffer.concat(chunks)
        resolve(result)
      })
      pdfDoc.on("error", (err: Error) => {
        reject(err)
      })
      pdfDoc.end()
    })
  } catch (error) {
    throw new HTTPError("Erro ao gerar o recibo.", 500)
  }
}
