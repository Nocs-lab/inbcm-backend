import xlsx from 'xlsx';
import fs from 'fs';
import { BemMuseologico } from '../models/db.js'; // Importe o modelo BemMuseologico

const getFirstXlsxFile = (directory) => {
    const files = fs.readdirSync(directory);
    for (const file of files) {
        if (file.endsWith('.xlsx')) {
            return file;
        }
    }
    return null; // Retorna null se nenhum arquivo .xlsx for encontrado
};

export const getData = () => {
    try {
        const uploadDirectory = './src/uploads/';
        const fileName = getFirstXlsxFile(uploadDirectory);
        
        if (!fileName) {
            console.error('Nenhum arquivo .xlsx encontrado na pasta de uploads');
            return null;
        }

        const workbook = xlsx.readFile(uploadDirectory + fileName);
        const sheetName = workbook.SheetNames[0];
        let data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });

        // Convertendo todos os valores para strings
        data = data.map(row => {
            const stringRow = {};
            for (const key in row) {
                stringRow[key] = row[key] !== null ? String(row[key]) : '';
            }
            return stringRow;
        });

        console.log(data);
        
        return data;
    } catch (error) {
        console.error('Erro ao ler arquivo Excel: ', error);
        return null;
    }
};


export const postData = async (rowData) => {
    try {
        await BemMuseologico.create(rowData); // Use o método create do Sequelize para inserir os dados
        console.log('Dados inseridos com sucesso');
    } catch (error) {
        console.error('Erro ao inserir dados: ', error);
        throw error; // Lançar o erro para ser tratado pelo controlador
    }
};

export const processExcelData = async () => {
    const data = getData();
    console.log(data);
    for (const rowData of data) {
        console.log(rowData);

      try {
        await postData(rowData);
        console.log('Dados inseridos com sucesso');
      } catch (error) {
        console.error('Erro ao inserir dados: ', error);
      }
    }
};