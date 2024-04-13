// routes.js
const express = require('express');
const routes = express.Router(); // Cria um roteador usando Express
const upload = require('../middlewares/UploadMiddleware'); // Importa o middleware de upload

// Importar controladores
const BibliograficoController = require('../controllers/BibliograficoController');
const MuseologicoController = require('../controllers/MuseologicoController');
const ArquivisticoController = require('../controllers/ArquivisticoController');

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
