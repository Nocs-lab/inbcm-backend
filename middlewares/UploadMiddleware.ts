import multer from "multer";

// Configuração de multer para lidar com uploads de arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Define o nome do arquivo
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Exporte o middleware de upload
export default upload;
