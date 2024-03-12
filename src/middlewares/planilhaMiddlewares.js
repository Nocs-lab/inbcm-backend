// src/middlewares/planilhaMiddlewares.js
import xlsx from 'xlsx';
import fs from 'fs';

const getFirstXlsxFile = (directory) => {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    if (file.endsWith('.xlsx')) {
      return file;
    }
  }
  return null; // Retorna null se nenhum arquivo .xlsx for encontrado
};

export const readXlsxFile = (directory) => {
  const fileName = getFirstXlsxFile(directory);
  if (!fileName) {
    throw new Error('Nenhum arquivo .xlsx encontrado na pasta de uploads');
  }

  const workbook = xlsx.readFile(directory + fileName);
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });

  return data;
};
