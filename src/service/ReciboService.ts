import mongoose from "mongoose"
import path from "path"
import { DataUtils } from "../utils/dataUtils"
import { Content, TDocumentDefinitions } from "pdfmake/interfaces"
import HTTPError from "../utils/error"
import {
  buscaDeclaracao,
  MapeadorCamposPercentual,
  formatarDadosRecibo
} from "./utilsDocuments"
import { DeclaracaoModel, IMuseu, IUsuario } from "../models"
import PdfPrinter from "pdfmake"
import { AnoDeclaracaoModel } from "../models/AnoDeclaracao"

const corrigirOrtografia: Record<string, string> = {
  museologico: "museológico",
  arquivistico: "arquivístico",
  bibliografico: "bibliográfico"
}

const gerarTabela = (
  tipo: "museologico" | "bibliografico" | "arquivistico",
  declaracao: DeclaracaoModel & {
    museu_id: IMuseu & { usuario: IUsuario }
    anoDeclaracao: AnoDeclaracaoModel
  }
) => {
  const campos = MapeadorCamposPercentual[tipo]
  const porcentagemPorCampo = declaracao[tipo]?.porcentagemPorCampo || []

  // Aplica a correção ortográfica
  const tipoCorrigido = corrigirOrtografia[tipo] || tipo

  return {
    table: {
      widths: ["60%", "40%"],
      body: [
        [
          {
            text: `Acervo ${tipoCorrigido}`,
            style: "tableHeader",
            fillColor: "#D9D9D9",
            colSpan: 2
          },
          {}
        ],
        [
          { text: "Campo", style: "tableHeader", alignment: "center" },
          { text: "Preenchimento", style: "tableHeader", alignment: "center" }
        ],
        ...porcentagemPorCampo.map(({ campo, percentual }) => {
          const campoKey = campo as keyof typeof campos
          return [
            {
              text: campos[campoKey] || campo,
              style: "tableData",
              alignment: "left"
            },
            { text: `${percentual}%`, style: "tableData", alignment: "center" }
          ]
        })
      ]
    },
    layout: {
      fillColor: function (rowIndex: number) {
        return rowIndex % 2 === 0 ? "#F5F5F5" : null
      }
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
async function gerarPDFRecibo(
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
    const declaracao = (await buscaDeclaracao(
      declaracaoId
    )) as unknown as DeclaracaoModel & {
      museu_id: IMuseu & { usuario: IUsuario }
      anoDeclaracao: AnoDeclaracaoModel
    }

    const dadosFormatados = formatarDadosRecibo(declaracao)
    const tabelaMuseologico = declaracao.museologico
      ? gerarTabela("museologico", declaracao)
      : undefined

    const tabelaBibliografico = declaracao.bibliografico
      ? gerarTabela("bibliografico", declaracao)
      : undefined

    const tabelaArquivistico = declaracao.arquivistico
      ? gerarTabela("arquivistico", declaracao)
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
          margin: [40, 10, 40, 40]
        }
      },

      content: [
        // Primeira página (conteúdo existente)
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
          text: "\n\n Resumo de preenchimento da declaração",
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
    console.error(error)
    throw new HTTPError("Erro ao gerar o recibo.", 500)
  }
}

export { gerarPDFRecibo }
