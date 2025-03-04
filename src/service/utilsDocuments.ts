import mongoose from "mongoose"
import { Declaracoes, DeclaracaoModel, IMuseu, IUsuario } from "../models"
import { DataUtils } from "../utils/dataUtils"
import HTTPError from "../utils/error"
import { AnoDeclaracaoModel } from "../models/AnoDeclaracao"

export const MapeadorCamposPercentual = {
  museologico: {
    nderegistro: "Número de Registro",
    outrosnumeros: "Outros Números",
    situacao: "Situação",
    denominacao: "Denominação",
    titulo: "Título",
    autor: "Autor",
    classificacao: "Classificação",
    resumodescritivo: "Resumo Descritivo",
    dimensoes: "Dimensões",
    materialtecnica: "Material/Técnica",
    estadodeconservacao: "Estado de Conservação",
    localdeproducao: "Local de Produção",
    datadeproducao: "Data de Produção",
    condicoesdereproducao: "Condições de Reprodução",
    midiasrelacionadas: "Mídias Relacionadas"
  },
  bibliografico: {
    nderegistro: "Número de Registro",
    outrosnumeros: "Outros Números",
    situacao: "Situação",
    titulo: "Título",
    tipo: "Tipo",
    identificacaoderesponsabilidade: "Identificação de Responsabilidade",
    localdeproducao: "Local de Produção",
    editora: "Editora",
    datadeproducao: "Data de Produção",
    dimensaofisica: "Dimensão Física",
    materialtecnica: "Material/Técnica",
    encadernacao: "Encadernação",
    resumodescritivo: "Resumo Descritivo",
    estadodeconservacao: "Estado de Conservação",
    assuntoprincipal: "Assunto Principal",
    assuntocronologico: "Assunto Cronológico",
    assuntogeografico: "Assunto Geográfico",
    condicoesdereproducao: "Condições de Reprodução",
    midiasrelacionadas: "Mídias Relacionadas"
  },
  arquivistico: {
    coddereferencia: "Código de Referência",
    titulo: "Título",
    data: "Data",
    niveldedescricao: "Nível de Descrição",
    dimensaoesuporte: "Dimensão e Suporte",
    nomedoprodutor: "Nome do Produtor",
    historiaadministrativabiografia: "História Administrativa/Biografia",
    historiaarquivistica: "História Arquivística",
    procedencia: "Procedência",
    ambitoeconteudo: "Âmbito e Conteúdo",
    sistemadearranjo: "Sistema de Arranjo",
    condicoesdereproducao: "Condições de Reprodução",
    existenciaelocalizacaodosoriginais:
      "Existência e Localização dos Originais",
    notassobreconservacao: "Notas sobre Conservação",
    pontosdeacessoeindexacaodeassuntos:
      "Pontos de Acesso e Indexação de Assuntos",
    midiasrelacionadas: "Mídias Relacionadas"
  }
}
/**
 * Obtém uma declaração pelo seu ID.
 *
 * @param declaracaoId - O ID da declaração a ser obtida.
 * @returns Uma promessa que resolve com a declaração encontrada.
 * @throws Um erro se a declaração não for encontrada.
 */
export async function buscaDeclaracao(declaracaoId: mongoose.Types.ObjectId) {
  const declaracao = await Declaracoes.findById(declaracaoId)
    .populate<{ museu_id: IMuseu & { usuario: IUsuario } }>({
      path: "museu_id",
      populate: { path: "usuario" }
    })
    .populate<{ anoDeclaracao: AnoDeclaracaoModel }>("anoDeclaracao")

  if (!declaracao) {
    throw new HTTPError(
      `Declaração não encontrada para o ID especificado: ${declaracaoId}`,
      404
    )
  }
  return declaracao
}

/**
 * Formata os dados de uma declaração para o recibo.
 *
 * @param declaracao - A declaração a ser formatada.
 * @returns Os dados formatados para o recibo.
 */
export function formatarDadosRecibo(
  declaracao: DeclaracaoModel & {
    museu_id: IMuseu & { usuario: IUsuario }
    anoDeclaracao: AnoDeclaracaoModel
  }
) {
  const totalBensDeclarados =
    (declaracao.arquivistico?.quantidadeItens || 0) +
    (declaracao.bibliografico?.quantidadeItens || 0) +
    (declaracao.museologico?.quantidadeItens || 0)

  const formatValue = (value: number | undefined): string =>
    value === undefined || value === 0 ? "0" : value.toString()

  const tipoDeclaracao = declaracao.retificacao ? "retificadora" : "original"

  const verificarPendencias = (pendencias: unknown[] | undefined): string => {
    return pendencias && pendencias.length > 0 ? "Sim" : "---"
  }

  return {
    anoCalendario: declaracao.anoDeclaracao.ano,
    codigoIdentificador: declaracao.museu_id.codIbram,
    nomeMuseu: declaracao.museu_id.nome,
    logradouro: declaracao.museu_id.endereco.logradouro,
    numero: declaracao.museu_id.endereco.numero,
    complemento: declaracao.museu_id.endereco.complemento,
    bairro: declaracao.museu_id.endereco.bairro,
    cep: declaracao.museu_id.endereco.cep,
    municipio: declaracao.museu_id.endereco.municipio,
    uf: declaracao.museu_id.endereco.uf,
    nomeDeclarante: declaracao.museu_id.usuario.nome,
    data: DataUtils.gerarDataFormatada(declaracao.dataRecebimento),
    hora: DataUtils.gerarHoraFormatada(declaracao.dataRecebimento),
    numeroRecibo: declaracao.hashDeclaracao,
    totalBensDeclarados: formatValue(totalBensDeclarados),
    bensMuseologicos: formatValue(declaracao.museologico?.quantidadeItens),
    bensBibliograficos: formatValue(declaracao.bibliografico?.quantidadeItens),
    bensArquivisticos: formatValue(declaracao.arquivistico?.quantidadeItens),
    tipoDeclaracao: tipoDeclaracao.toUpperCase(),
    statusDeclaracao: declaracao.status,
    statusArquivoArquivistico: declaracao.arquivistico?.status || "---",
    statusArquivoMuseologico: declaracao.museologico?.status || "---",
    statusArquivoBibliografico: declaracao.bibliografico?.status || "---",
    pendenciaisArquivoMuseologico: verificarPendencias(
      declaracao.museologico?.pendencias
    ),
    pendenciaisArquivoArquivisitico: verificarPendencias(
      declaracao.arquivistico?.pendencias
    ),
    pendenciaisArquivoBibliografico: verificarPendencias(
      declaracao.bibliografico?.pendencias
    )
  }
}
