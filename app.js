import express from 'express';
import cors from 'cors';
import router from './src/routes/uploadRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(router);

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});