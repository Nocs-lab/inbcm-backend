import express from 'express';
import upload from '../middlewares/UploadMiddleware.js';

// Importar controladores
import BibliograficoController from '../controllers/BibliograficoController.js';
import MuseologicoController from '../controllers/MuseologicoController.js';
import ArquivisticoController from '../controllers/ArquivisticoController.js';

const routes = express.Router(); // Cria um roteador usando Express

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
export default routes;
