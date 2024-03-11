import knex from 'knex';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const db = knex({
  client: 'mysql',
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
  }
});

// Testa a conexão com o banco de dados
db.raw('SELECT 1')
  .then(() => console.log('Conexão com o banco de dados bem-sucedida'))
  .catch(err => console.error('Erro ao conectar com o banco de dados: ' + err.message));

export default db;