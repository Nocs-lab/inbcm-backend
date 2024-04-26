import multer from "multer";

// Configuração de multer para lidar com uploads de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {

  let tipoAcervo = '';
  let tipoDeclaracao = req.path.split('/')[1]; // Obtém o tipo de arquivo da rota
  switch (tipoDeclaracao) {
    case 'museologico':
      tipoAcervo = 'M'; // Museológico
      break;
    case 'bibliografico':
      tipoAcervo = 'B'; // Bibliográfico
      break;
    case 'arquivistico':
      tipoAcervo = 'A'; // Arquivístico
      break;
    default:
      throw new Error('Tipo de declaração inválido.');
  }

    // Define o nome do arquivo
    const IDENTIFICADORMUSEU = "81";
    const ANODECLARACAO = "2023";
    const TIPODECLARACAO =  tipoDeclaracao;
    const TIPOACERVO = tipoAcervo;
    const date = new Date();
    const DATA = date.toLocaleString('pt-BR', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\//g, '').replace(',', '_').replace(/:/g, '');
    const filename = `${IDENTIFICADORMUSEU}_${ANODECLARACAO}_${TIPOACERVO}_${TIPODECLARACAO}_${DATA}.xlsx`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Exporte o middleware de upload
export default upload;
