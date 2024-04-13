import mongoose from 'mongoose';

const { Schema } = mongoose;

const DeclaracaoSchema = new Schema({
    nome: String, // Nome do arquivo
    caminho: String, // Caminho completo do arquivo (ex: uploads/planilha.xlsx)
    dataEnvio: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        enum: [
            'em processamento', // A declaração foi recebida, mas o processamento ainda não foi concluído.
            'em fila de restituição', // Indica que o contribuinte tem direito a restituição, mas ainda não foi disponibilizada.
            'inserido', // A declaração foi recebida pela Receita Federal e o processamento foi concluído.
            'com pendências', // Foram encontradas pendências em relação a algumas informações.
            'em análise', // A declaração aguarda a apresentação de documentos ou a conclusão da análise de documentos.
            'retificada', // A declaração foi substituída por declaração retificadora apresentada pelo contribuinte.
            'cancelada', // A declaração foi cancelada por interesse da administração tributária ou por solicitação do contribuinte.
            'tratamento manual' // A declaração está sendo analisada manualmente.
        ],
        default: 'em processamento'
    }
});

const Declaracoes = mongoose.model('Declaracoes', DeclaracaoSchema);

export default Declaracoes;
