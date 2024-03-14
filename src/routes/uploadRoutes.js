import express from 'express';
import controller from '../controllers/uploadController.js';


const router = express.Router();

router.get('/', controller.getTeste);

router.post('/upload', controller.postUpload);

router.get('/planilha', controller.getUpload);



export default router;