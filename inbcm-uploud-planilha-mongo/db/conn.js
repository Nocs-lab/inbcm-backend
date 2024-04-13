import mongoose from 'mongoose';

async function main() {
    try {
        mongoose.set('strictQuery', true);
        await mongoose.connect('mongodb+srv://ricksonroccha:kkiag6cSXcij3IXY@cluster0.pwhthy0.mongodb.net/INBCM');
        console.log('Conectado ao MongoDB!');
    } catch (error) {
        console.log(`Erro: ${error}`);
    }
}

// Exporte a função `main` como exportação padrão
export default main;
