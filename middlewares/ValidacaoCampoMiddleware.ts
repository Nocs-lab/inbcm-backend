// middlewares/ValidacaoCampoMiddleware.js
import xlsx from "xlsx";

// Função para extrair os nomes das colunas da planilha Excel
const extractColumnsFromExcel = (file) => {
  if (!file || !file.buffer) {
    return [];
  }

  const workbook = xlsx.read(file.buffer, { type: "buffer" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const headers = {};
  for (let key in sheet) {
    // Pulando as células não de cabeçalho
    if (key[0] === "!") continue;
    // Obtendo a coluna e a linha de cada célula
    const col = key.substring(0, 1);
    const row = parseInt(key.substring(1));
    // Armazenando os cabeçalhos das colunas
    if (row === 1) {
      headers[col] = sheet[key].v;
    }
  }
  return Object.values(headers);
};

// Middleware para validar colunas da planilha arquivística
const validarArquivistico = (req, res, next) => {
  const requiredColumns = [
    "codigoReferencia",
    "titulo",
    "data",
    "nivelDescricao",
    "dimensaoSuporte",
    "nomeProdutor",
    "historiaAdministrativaBiografia",
    "historiaArquivistica",
    "procedencia",
    "ambitoConteudo",
    "sistemaArranjo",
    "condicoesReproducao",
    "existenciaLocalizacaoOriginais",
    "notasConservacao",
    "pontosAcessoIndexacaoAssuntos",
    "midiasRelacionadas"
  ];

  // Extrair os nomes das colunas do arquivo enviado
  const uploadedColumns = extractColumnsFromExcel(req.file);

  // Comparar com as colunas requeridas
  const missingColumns = requiredColumns.filter(column => !uploadedColumns.includes(column));
  if (missingColumns.length === 0) {
    next();
  } else {
    return res.status(400).json({ error: `Planilha arquivística: não está no modelo definido pela Resolução Normativa do IBRAM, nº 6, de 31 de agosto de 2021. Colunas ausentes: ${missingColumns.join(', ')}` });
  }
};

// Middleware para validar colunas da planilha bibliográfica
const validarBibliografico = (req, res, next) => {
  const requiredColumns = [
    "numeroRegistro",
    "outrosNumeros",
    "situacao",
    "titulo",
    "tipo",
    "identificacaoResponsabilidade",
    "localProducao",
    "editora",
    "data",
    "dimensaoFisica",
    "materialTecnica",
    "encadernacao",
    "resumoDescritivo",
    "estadoConservacao",
    "assuntoPrincipal",
    "assuntoCronologico",
    "assuntoGeografico",
    "condicoesReproducao",
    "midiasRelacionadas"
  ];

  // Extrair os nomes das colunas do arquivo enviado
  const uploadedColumns = extractColumnsFromExcel(req.file);

  // Comparar com as colunas requeridas
  const missingColumns = requiredColumns.filter(column => !uploadedColumns.includes(column));
  if (missingColumns.length === 0) {
    next();
  } else {
    return res.status(400).json({ error: `Planilha bibliográfica: não está no modelo definido pela Resolução Normativa do IBRAM, nº 6, de 31 de agosto de 2021. Colunas ausentes: ${missingColumns.join(', ')}` });
  }
};

// Middleware para validar colunas da planilha museológica
const validarMuseologico = (req, res, next) => {
  const requiredColumns = [
    "numeroRegistro",
    "outrosNumeros",
    "situacao",
    "denominacao",
    "titulo",
    "autor",
    "classificacao",
    "resumoDescritivo",
    "dimensoes",
    "materialTecnica",
    "estadoConservacao",
    "localProducao",
    "dataProducao",
    "condicoesReproducao",
    "midiasRelacionadas"
  ];

  // Extrair os nomes das colunas do arquivo enviado
  const uploadedColumns = extractColumnsFromExcel(req.file);

  // Comparar com as colunas requeridas
  const missingColumns = requiredColumns.filter(column => !uploadedColumns.includes(column));
  if (missingColumns.length === 0) {
    next();
  } else {
    return res.status(400).json({ error: `Planilha museológica: não está no modelo definido pela Resolução Normativa do IBRAM, nº 6, de 31 de agosto de 2021. Colunas ausentes: ${missingColumns.join(', ')}` });
  }
};

export { validarArquivistico, validarBibliografico, validarMuseologico };
