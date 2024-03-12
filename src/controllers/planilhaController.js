// src/controllers/planilhaController.js

import { getData, processExcelData } from '../middlewares/dbMiddlewares.js';

export const getDataController = async (req, res) => {
    console.log("getDataController foi chamado");
    try {
      const data = await getData();
      if (data) {
        console.log("Dados recebidos:", data);
        res.json(data);
      } else {
        console.log("Nenhum dado recebido.");
        res.json({ message: 'Nenhum dado encontrado.' });
      }
    } catch (error) {
      console.error("Erro ao obter dados:", error);
      res.status(500).json({ error: 'Ocorreu um erro ao obter os dados' });
    }
  };

export const insertData = async (req, res) => {
  try {
    const data = await getData(); // Obtenha os dados da planilha

    // Se os dados forem obtidos com sucesso, insira-os no banco de dados
    if (data) {
      await processExcelData(); // Chame a função para processar e inserir os dados na tabela 'tb_bem_museologico'
      res.json({ message: 'Dados inseridos no banco de dados com sucesso.' });
    } else {
      // Se ocorrer algum erro ao obter os dados, envie uma mensagem de erro
      res.status(500).json({ error: 'Erro ao obter os dados da planilha.' });
    }
  } catch (error) {
    console.error('Erro ao inserir dados no banco de dados:', error);
    res.status(500).json({ error: 'Erro ao inserir dados no banco de dados.' });
  }
};