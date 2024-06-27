const fs = require('fs');
const PdfPrinter = require('pdfmake');

const fonts = {
  Roboto: {
		normal: 'fonts/Roboto-Regular.ttf',
		bold: 'fonts/Roboto-Medium.ttf',
		italics: 'fonts/Roboto-Italic.ttf',
		bolditalics: 'fonts/Roboto-MediumItalic.ttf'
	}
};

const printer = new PdfPrinter(fonts);

const docDefinition = {
  content: [
    {
      table: {
        widths: ['*'],
        body: [[{
          columns: [
            { text: 'INSTITUTO BRASILEIRO DE MUSEUS', style: 'headerLeft' },
            { text: 'ANO-CALENDÁRIO 2024', style: 'headerRight' }
          ]
        }]]
      }
    },
    { text: '\nRECIBO DE ENTREGA DE DECLARAÇÃO DE AJUSTE ANUAL\n\n', style: 'title' },
    {
      table: {
        headerRows: 1,
        widths: ['*', '*', '*'],
        body: [
    [{ text: 'Código identificador IBRAM', style: 'tableHeader' }, { text: 'Nome do museu', style: 'tableHeader', colSpan: 2 }, {}],
          ['1c6989cd-bc43-4fef-841e-04c6683a4a6b', { text: 'Museu Prof(a). Alessandro Moreira', colSpan: 2 }, {}],
          [{ text: 'Logradouro', style: 'tableHeader' }, { text: 'Número', style: 'tableHeader' }, { text: 'Complemento', style: 'tableHeader' }],
          [{ text: 'Yango Rodovia' }, '32370', 'Casa 4'],
          [{ text: 'Bairro', style: 'tableHeader' }, { text: 'CEP', style: 'tableHeader' }, { text: 'Município/UF', style: 'tableHeader' }],
          ['Melo de Nossa Senhora', '16080-002', 'João Lucas do Descoberto/RR']
        ]
      },
      layout: {
        fillColor: function (rowIndex) {
          return (rowIndex % 2 === 0) ? '#CCCCCC' : null;
        }
      }
    },
    { text: '\nTOTAL DE BENS DECLARADOS\n\n', style: 'sectionHeader' },
    {
      table: {
        headerRows: 1,
        widths: ['*', '*'],
        body: [
          [{ text: 'TOTAL DE BENS DECLARADOS', style: 'tableHeader' }, { text: '1', style: 'tableData' }],
          [{ text: 'Bens museológicos', style: 'tableHeader' }, { text: '1', style: 'tableData' }],
          [{ text: 'Bens bibliográficos', style: 'tableHeader' }, { text: '---', style: 'tableData' }],
          [{ text: 'Bens arquivísticos', style: 'tableHeader' }, { text: '---', style: 'tableData' }]
        ]
      }
    },
    { text: '\nSr(a) Vicente Melo,\n', style: 'footerText' },
    { text: 'O NÚMERO DE RECIBO DE SUA DECLARAÇÃO APRESENTADO EM DATA E HORA 20/06/2024, 10:33:14, é\n', style: 'footerText' },
    { text: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', style: 'footerReceipt' }
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
      fontSize: 12,
      bold: true,
      alignment: 'center'
    },
    footerText: {
      fontSize: 12,
      bold: true,
      alignment: 'left'
    },
    footerReceipt: {
      fontSize: 12,
      bold: true,
      alignment: 'center'
    }
  }
};

const pdfDoc = printer.createPdfKitDocument(docDefinition);
pdfDoc.pipe(fs.createWriteStream('recibo.pdf'));
pdfDoc.end();
