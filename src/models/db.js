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

// Defina o modelo da tabela tb_bem_museologico
const BemMuseologico = sequelize.define('tb_bem_museologico', {
  Num_de_Registro: {
    type: Sequelize.STRING,
    allowNull: true,
    primaryKey: true
  },
  Outros_Numeros: {
    type: Sequelize.STRING
  },
  Situacao: {
    type: Sequelize.STRING,
    allowNull: true
  },
  Denominacao: {
    type: Sequelize.STRING,
    allowNull: true
  },
  Titulo: {
    type: Sequelize.STRING
  },
  Autor: {
    type: Sequelize.STRING,
    allowNull: true
  },
  Classificacao: {
    type: Sequelize.STRING
  },
  Resumo_Descritivo: {
    type: Sequelize.STRING,
    allowNull: true
  },
  Dimensoes: {
    type: Sequelize.STRING,
    allowNull: true
  },
  Altura: {
    type: Sequelize.STRING
  },
  Largura: {
    type: Sequelize.STRING
  },
  Profundidade: {
    type: Sequelize.STRING
  },
  Diametro: {
    type: Sequelize.STRING
  },
  Espessura: {
    type: Sequelize.STRING
  },
  Unid_de_pesagem: {
    type: Sequelize.STRING,
    allowNull: true
  },
  Peso: {
    type: Sequelize.STRING,
    allowNull: true
  },
  Material_Tecnica: {
    type: Sequelize.STRING,
    allowNull: true
  },
  Estado_de_Conservacao: {
    type: Sequelize.STRING,
    allowNull: true
  },
  Local_de_Producao: {
    type: Sequelize.STRING
  },
  Data_de_Producao: {
    type: Sequelize.STRING
  },
  Condicoes_de_Reproducao: {
    type: Sequelize.STRING,
    allowNull: true
  },
  Midias_Relacionadas: {
    type: Sequelize.STRING
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
