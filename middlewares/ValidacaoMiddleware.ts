import xlsx from "xlsx";

function validarTipoArquivo(req, res, next) {
  const tipoDeclaracao = req.path.split('/')[1]; // Obtém o tipo de arquivo da rota
  const colunasEsperadas = {
    arquivistico: [
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
    ],
    bibliografico: [
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
    ],
    museologico: [
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
    ]
  };

  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
  }

  const workbook = xlsx.readFile(file.path);
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const firstRow = xlsx.utils.sheet_to_json(worksheet, { header: 1 })[0];

  const colunasEsperadasTipo = colunasEsperadas[tipoDeclaracao];

  if (!colunasEsperadasTipo) {
    return res.status(400).json({ error: 'Tipo de declaração inválido.' });
  }

  const colunasFaltantes = colunasEsperadasTipo.filter(coluna => !firstRow.includes(coluna));
  const colunasExcedentes = firstRow.filter(coluna => !colunasEsperadasTipo.includes(coluna));

  if (colunasFaltantes.length > 0 || colunasExcedentes.length > 0) {
    const errors = [];
    if (colunasFaltantes.length > 0) {
      errors.push(`Na declaração enviada, a(s) coluna(s) "${colunasFaltantes.join('", "')}" não está(ão) no modelo definido pela Resolução Normativa do IBRAM, nº 6, de 31 de agosto de 2021.`);
    }
    if (colunasExcedentes.length > 0) {
      errors.push(`Na declaração enviada, a(s) coluna(s) "${colunasExcedentes.join('", "')}" são excedentes e não estão no modelo definido pela Resolução Normativa do IBRAM, nº 6, de 31 de agosto de 2021.`);
    }
    return res.status(400).json({ error: 'A planilha não corresponde ao formato esperado.', menssage: errors });
  }

  next();
}

export default validarTipoArquivo;
