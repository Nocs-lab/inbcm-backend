import mongoose from "mongoose";
import { DeclaracaoModel, Declaracoes, Museu, Usuario } from "../models";
import PdfPrinter from "pdfmake";
import { IMuseu } from '../models/Museu';
import { IUsuario } from '../models/Usuario';
import path from "path";


/**
 * Obtém uma declaração pelo seu ID.
 *
 * @param declaracaoId - O ID da declaração a ser obtida.
 * @returns Uma promessa que resolve com a declaração encontrada.
 * @throws Um erro se a declaração não for encontrada.
 */
async function buscaDeclaracao(declaracaoId: mongoose.Types.ObjectId) {
  const declaracao = await Declaracoes.findById(declaracaoId);
  if (!declaracao) {
    throw new Error(`Declaração não encontrada para o ID especificado: ${declaracaoId}`);
  }
  return declaracao;
}

/**
 * Obtém um museu pelo seu ID.
 *
 * @param museuId - O ID do museu a ser obtido.
 * @returns Uma promessa que resolve com o museu encontrado.
 * @throws Um erro se o museu não for encontrado.
 */
async function buscaMuseu(museuId: mongoose.Types.ObjectId) {
  const museu = await Museu.findById(museuId);
  if (!museu) {
    throw new Error(`Museu não encontrado para o ID especificado: ${museuId}`);
  }
  return museu;
}

async function buscaUsuario(usuarioId: mongoose.Types.ObjectId) {
  const usuario = await Usuario.findById(usuarioId);
  if (!usuario) {
    throw new Error(`Usuário não encontrado para o ID especificado: ${usuarioId}`);
  }
  return usuario;
}

/**
 * Formata os dados de uma declaração para o recibo.
 *
 * @param declaracao - A declaração a ser formatada.
 * @param museu - O museu relacionado à declaração.
 * @param usuario - O usuário relacionado ao museu.
 * @returns Os dados formatados para o recibo.
 */
function formatarDadosRecibo(declaracao: DeclaracaoModel, museu: IMuseu, usuario: IUsuario) {
  const totalBensDeclarados =
  (declaracao.arquivistico?.quantidadeItens || 0) +
  (declaracao.bibliografico?.quantidadeItens || 0) +
  (declaracao.museologico?.quantidadeItens || 0);

  const formatValue = (value: number | undefined): string => (value === undefined || value === 0) ? '---' : value.toString();
  const tipoDeclaracao = declaracao.retificacao ? "retificadora" : "original";

  return {
    anoCalendario: declaracao.anoDeclaracao,
    codigoIdentificador: museu.codIbram,
    nomeMuseu: museu.nome,
    logradouro: museu.endereco.logradouro,
    numero: museu.endereco.numero,
    complemento: museu.endereco.complemento,
    bairro: museu.endereco.bairro,
    cep: museu.endereco.cep,
    municipio: museu.endereco.municipio,
    uf: museu.endereco.uf,
    nomeDeclarante: usuario.nome,
    data: new Date().toLocaleDateString("pt-BR"),
    hora: new Date().toLocaleTimeString("pt-BR"),
    numeroRecibo: declaracao.hashDeclaracao,
    totalBensDeclarados: formatValue(totalBensDeclarados),
    bensMuseologicos: formatValue(declaracao.museologico?.quantidadeItens),
    bensBibliograficos: formatValue(declaracao.bibliografico?.quantidadeItens),
    bensArquivisticos: formatValue(declaracao.arquivistico?.quantidadeItens),
    tipoDeclaracao: tipoDeclaracao.toUpperCase()
  };
}

/**
 * Gera o PDF do recibo com base no ID da declaração.
 *
 * @param declaracaoId - O ID da declaração para a qual gerar o recibo.
 * @returns Uma promessa que resolve com o buffer do PDF do recibo gerado.
 * @throws Um erro se houver algum problema ao gerar o recibo.
 */

async function gerarPDFRecibo(declaracaoId: mongoose.Types.ObjectId): Promise<Buffer> {
  const fonts = {
    Roboto: {
      normal: path.resolve("fonts/Roboto-Regular.ttf"),
      bold: path.resolve("fonts/Roboto-Medium.ttf"),
      italics: path.resolve("fonts/Roboto-Italic.ttf"),
      bolditalics: path.resolve("fonts/Roboto-MediumItalic.ttf")
    }
  };
  const printer = new PdfPrinter(fonts);

  try {
    const declaracao = await buscaDeclaracao(declaracaoId);
    const museu = await buscaMuseu(declaracao.museu_id);
    const usuario = await buscaUsuario(museu.usuario);

    const dadosFormatados = formatarDadosRecibo(declaracao, museu, usuario);
    
    const docDefinition:any = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      
      content: [
        {
          table: {
            widths: ['*'],
            body: [
              [{
                columns: [
                  { text: 'INSTITUTO BRASILEIRO DE MUSEUS', style: 'headerLeft' },
                  { text: `ANO-CALENDÁRIO ${dadosFormatados.anoCalendario}`, style: 'headerRight' }
                ]
              }]
            ]
          }
        },
        { text: '\nRECIBO DE ENTREGA DE DECLARAÇÃO DE AJUSTE ANUAL\n', style: 'title' },
        { text: `DECLARAÇÃO ${dadosFormatados.tipoDeclaracao}`, style: 'title' },
        { text: '\n\n'},
        {text:'Identificação do declarante',style:'title'},
        {
          table: {
            headerRows: 1,
            widths: ['*', '*', '*'],
            body: [
              [{ text: 'Código identificador IBRAM', style: 'tableHeader' }, { text: 'Nome do museu', style: 'tableHeader', colSpan: 2 }, {}],
              [dadosFormatados.codigoIdentificador, { text: dadosFormatados.nomeMuseu, colSpan: 2 }, {}],
              [{ text: 'Logradouro', style: 'tableHeader' }, { text: 'Número', style: 'tableHeader' }, { text: 'Complemento', style: 'tableHeader' }],
              [dadosFormatados.logradouro, dadosFormatados.numero, dadosFormatados.complemento],
              [{ text: 'Bairro', style: 'tableHeader' }, { text: 'CEP', style: 'tableHeader' }, { text: 'Município/UF', style: 'tableHeader' }],
              [dadosFormatados.bairro, dadosFormatados.cep, `${dadosFormatados.municipio}/${dadosFormatados.uf}`]
            ]
          },
          layout: {
            fillColor: function (rowIndex: number) {
              return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
            }
          }
        },
        { text: '\nTotal  de bens  declarados', style: 'sectionHeader' },
        {
          table: {
            headerRows: 1,
            widths: ['*', '*'],
            body: [
              [{ text: 'Bens museológicos', style: 'tableHeader' }, { text: dadosFormatados.bensMuseologicos, style: 'tableData',alignment:'right' }],
              [{ text: 'Bens bibliográficos', style: 'tableHeader' }, { text: dadosFormatados.bensBibliograficos, style: 'tableData',alignment:'right' }],
              [{ text: 'Bens arquivísticos', style: 'tableHeader' }, { text: dadosFormatados.bensArquivisticos, style: 'tableData',alignment:'right' }],
              [{ text: 'TOTAL DE BENS DECLARADOS', style: 'tableHeader' }, { text: dadosFormatados.totalBensDeclarados, style: 'tableData',alignment:'right' }],
            ]
          }
        },
        { text: '\n\n'},
        { text: `\nSr(a) ${dadosFormatados.nomeDeclarante},\n`, style: 'footerText' },
        { text: `O NÚMERO DE RECIBO DE SUA DECLARAÇÃO, APRESENTADO EM  ${dadosFormatados.data} ás ${dadosFormatados.hora}, é: \n`, style: 'footerText' },
        { text: '\n\n'},
        { text: dadosFormatados.numeroRecibo, style: 'footerReceipt' }
        
      ],
      
      styles: {
        headerLeft: {
          fontSize: 12,
          bold: true,
          alignment: 'left'
        },
        headerRight: {
          fontSize: 12,
          bold: true,
          alignment: 'right'
        },
        title: {
          fontSize: 14,
          bold: true,
          alignment: 'center'
        },
        tableHeader: {
          bold: true,
          fontSize: 12,
          color: 'black'
        },
        tableData: {
          fontSize: 12
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          alignment: 'center'
        },
        footerText: {
          fontSize: 10,
          alignment: 'left',
          color: 'black'
        },
        footerReceipt: {
          fontSize: 10,
          bold: true,
          alignment: 'center',
          border: [true, true, true, true],
          borderColor: '#0000',
          color: '#000000' 
        },
        pageNumber: {
          fontSize: 8,
          alignment: 'right',
          margin: [0, 20, 20, 0]
        }
      }
    };
    console.log(`Número do recibo: ${dadosFormatados.numeroRecibo}`)
    return new Promise<Buffer>((resolve, reject) => {
      const pdfDoc = printer.createPdfKitDocument(docDefinition);
      let chunks: Buffer[] = [];
      
      pdfDoc.on('data', (chunk: Buffer) => chunks.push(chunk));
      pdfDoc.on('end', () => {
        const result = Buffer.concat(chunks);
        resolve(result);
      });
      pdfDoc.on('error', (err: Error) => {
        reject(err);
      });
      pdfDoc.end();
    });

  } catch (error) {
    console.error("Erro ao gerar o recibo:", error);
    throw new Error("Erro ao gerar o recibo.");
  }
}




export { gerarPDFRecibo };
