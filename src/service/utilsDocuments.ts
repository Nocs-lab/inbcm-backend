import mongoose from "mongoose"
import {
  Declaracoes,
  Museu,
  Usuario,
  DeclaracaoModel,
  IMuseu,
  IUsuario
} from "../models"
import { DataUtils } from "../utils/dataUtils"
import HTTPError from "../utils/error"

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
  if (!declaracao) {
    throw new HTTPError(
      `Declaração não encontrada para o ID especificado: ${declaracaoId}`,
      404
    )
  }
  return declaracao
}

/**
 * Obtém um museu pelo seu ID.
 *
 * @param museuId - O ID do museu a ser obtido.
 * @returns Uma promessa que resolve com o museu encontrado.
 * @throws Um erro se o museu não for encontrado.
 */
export async function buscaMuseu(museuId: mongoose.Types.ObjectId) {
  const museu = await Museu.findById(museuId)
  if (!museu) {
    throw new HTTPError(
      `Museu não encontrado para o ID especificado: ${museuId}`,
      404
    )
  }
  return museu
}

export async function buscaUsuario(usuarioId: mongoose.Types.ObjectId) {
  const usuario = await Usuario.findById(usuarioId)
  if (!usuario) {
    throw new HTTPError(
      `Usuário não encontrado para o ID especificado: ${usuarioId}`,
      404
    )
  }
  return usuario
}

/**
 * Formata os dados de uma declaração para o recibo.
 *
 * @param declaracao - A declaração a ser formatada.
 * @param museu - O museu relacionado à declaração.
 * @param usuario - O usuário relacionado ao museu.
 * @returns Os dados formatados para o recibo.
 */
export function formatarDadosRecibo(
  declaracao: DeclaracaoModel,
  museu: IMuseu,
  usuario: IUsuario
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
    anoCalendario: declaracao.anoDeclaracao,
    codigoIdentificador: museu.codIbram,
    nomeMuseu: museu.nome,
    logradouro: museu.endereco.logradouro,
    numero: museu.endereco.numero,
    complemento: museu.endereco.complemento,
    bairro: museu.endereco.bairro,
    cep: museu.endereco.cep,
    municipio: museu.endereco.municipio,
    uf: museu.endereco.uf,
    nomeDeclarante: usuario.nome,
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
