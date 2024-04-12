const express = require("express");
const cors = require("cors");
const multer = require('multer');
const app = express();

const BibliograficoController = require('../controllers/BibliograficoController.js');
const MuseologicoController  = require('../controllers/MuseologicoController.js');
const ArquivisticoController = require('../controllers/ArquivisticoController.js');
const { getTeste } = require('../controllers/TestController.js');

const upload = multer({ dest: 'uploads/' });

const bibliograficoController = new BibliograficoController();
const museologicoController = new MuseologicoController();
const arquivisticoController = new ArquivisticoController();
app.use(cors());
app.use(express.json());

app.get('/api/test', getTeste); // Rota de teste de conexão

app.post('/api/bibliografico/upload', upload.single('file'), bibliograficoController.uploudBibliograficoModel);
app.post('/api/museologico/upload', upload.single('file'), museologicoController.uploudMuselogicoModel);
app.post('/api/arquivistico/upload', upload.single('file'), arquivisticoController.uploudArquivisticoModel);

// Conexão com o banco de dados
const conn = require("../db/conn.js");
conn();

app.listen(3000, function() {
    console.log("Servidor funcionando!");
    
});

//kkiag6cSXcij3IXY
//ricksonroccha
//thfields