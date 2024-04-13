const express = require('express');
const multer = require('multer');
const routes = express.Router(); // Cria um roteador usando Express

// Importar controladores
const BibliograficoController = require('../controllers/BibliograficoController');
const MuseologicoController = require('../controllers/MuseologicoController');
const ArquivisticoController = require('../controllers/ArquivisticoController');

// Configurar multer para lidar com uploads de arquivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Defina a pasta de destino para os uploads
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        // Mantenha o nome original do arquivo
        cb(null, file.originalname + '-' + Date.now());
    }
});

const upload = multer({ storage });

// Instanciar controladores
const bibliograficoController = new BibliograficoController();
const museologicoController = new MuseologicoController();
const arquivisticoController = new ArquivisticoController();

// Definir rotas de upload para cada tipo de arquivo
routes.post('/bibliografico/upload', upload.single('file'), bibliograficoController.uploadBibliograficoModel);
routes.post('/museologico/upload', upload.single('file'), museologicoController.uploadMuseologicoModel);
routes.post('/arquivistico/upload', upload.single('file'), arquivisticoController.uploadArquivisticoModel);

// Adicionar rota de teste
routes.get('/teste', (req, res) => {
    res.send('Rota de teste funcionando!');
});

// Exportar o roteador configurado
module.exports = routes;
