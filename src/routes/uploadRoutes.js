import express from 'express';
import controller from '../controllers/uploadController.js';

const router = express.Router();

router.get('/', controller.getHome);

router.post('/upload', controller.postUpload);

// router.get('/museologico', controller.getMuseologico);

// router.post('/museologico', controller.setMuseologico);

// router.get('/arquivistico', controller.getArquivistico);

// router.post('/arquivistico', controller.setArquivistico);

// router.get('/bibliografico', controller.getBibliografico);

// router.post('/bibliografico', controller.setBibliografico);

export default router;