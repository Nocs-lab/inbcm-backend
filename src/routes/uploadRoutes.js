import express from 'express';
import controller from '../controllers/uploadController.js';
import { getDataController } from '../controllers/planilhaController.js';
import { insertData } from '../controllers/planilhaController.js';

const router = express.Router();

router.get('/', controller.getHome);

router.post('/upload', controller.postUpload);

router.get('/planilha', getDataController);

router.post('/insert', insertData);

// router.get('/museologico', controller.getMuseologico);

// router.post('/museologico', controller.setMuseologico);

// router.get('/arquivistico', controller.getArquivistico);

// router.post('/arquivistico', controller.setArquivistico);

// router.get('/bibliografico', controller.getBibliografico);

// router.post('/bibliografico', controller.setBibliografico);

export default router;