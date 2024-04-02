// src/models/db.js

import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});


const BemMuseologico = sequelize.define('users', { 
  id: {
    type: Sequelize.STRING,
    allowNull: true,
    primaryKey: true
  },
  nome: {
    type: Sequelize.STRING
  },
  email: {
    type: Sequelize.STRING,
    allowNull: true
  }
});

// Sincronize o modelo com o banco de dados
(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexão com o banco de dados estabelecida com sucesso.');

    // Sincronize os modelos com o banco de dados
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados com o banco de dados.');

  } catch (error) {
    console.error('Erro ao conectar e sincronizar com o banco de dados:', error);
  }
})();

export default sequelize;
export { BemMuseologico };
