import mongoose from "mongoose";
import path from "path";
import { DeclaracaoModel, Declaracoes,Museu,Usuario} from "../models";
import ejs from "ejs";
import htmlToPdf from "html-pdf";
import { IMuseu } from '../models/Museu';
import { IUsuario } from '../models/Usuario';
import { ReciboDados } from "../types/DadosRecibo";

/**
 * Obtém uma declaração pelo seu ID.
 * 
 * @param declaracaoId - O ID da declaração a ser obtida.
 * @returns Uma promessa que resolve com a declaração encontrada.
 * @throws Um erro se a declaração não for encontrada.
 */

async function buscaDeclaracao(declaracaoId:mongoose.Types.ObjectId){
    const declaracao = await Declaracoes.findById(declaracaoId);
    if (!declaracao) {
      throw new Error(`Declaração não encontrada para o ID especificado: ${declaracaoId}`);
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
async function buscaMuseu(museuId:mongoose.Types.ObjectId){
  const museu = await Museu.findById(museuId);
  if (!museu) {
    throw new Error(`Museu não encontrado para o ID especificado: ${museuId}`);
  }
  return museu;
}
async function buscaUsuario(usuarioId:mongoose.Types.ObjectId){
  const usuario = await Usuario.findById(usuarioId);
  if (!usuario) {
    throw new Error(`Usuário não encontrado para o ID especificado: ${usuarioId}`);
  }
  return usuario;
}
/**
 * Formata os dados de uma declaração para o recibo.
 * 
 * @param declaracao - A declaração a ser formatada.
 * @param museu - O museu relacionado à declaração.
 * @param usuario - O usuário relacionado ao museu.
 * @returns Os dados formatados para o recibo.
 */
function formatarDadosRecibo(declaracao: DeclaracaoModel,museu:IMuseu,usuario:IUsuario){
  const totalBensDeclarados =
    (declaracao.arquivistico.quantidadeItens || 0) +
    (declaracao.bibliografico.quantidadeItens || 0) +
    (declaracao.museologico.quantidadeItens || 0);

  const formatValue = (value: number): string => value === 0 ? '---' : value.toString();
  const tipoDeclaracao = declaracao.retificacao ? "retificadora" : "original";

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
    horaData: new Date().toLocaleString("pt-BR"),
    numeroRecibo: declaracao.hashDeclaracao,
    totalBensDeclarados: formatValue(totalBensDeclarados),
    bensMuseologicos: formatValue(declaracao.museologico.quantidadeItens),
    bensBibliograficos: formatValue(declaracao.bibliografico.quantidadeItens),
    bensArquivisticos: formatValue(declaracao.arquivistico.quantidadeItens),
    tipoDeclaracao: tipoDeclaracao.toUpperCase()
  };
}
/**
 * Renderiza um template de recibo com os dados fornecidos.
 * 
 * @param dados - Os dados a serem usados para renderizar o template.
 * @returns Uma promessa que resolve com o conteúdo HTML do recibo renderizado.
 */
async function redenrizarTemplate(dados:ReciboDados){
  const templatePath = path.join(__dirname, "../templates/ejs/recibo.ejs");
  return await ejs.renderFile(templatePath, dados);
}
/**
 * Converte o conteúdo HTML para PDF.
 * 
 * @param htmlContent - O conteúdo HTML a ser convertido.
 * @returns Uma promessa que resolve com o buffer do PDF gerado.
 */
function converterHtmlParaPdf(htmlContent: string): Promise<Buffer> {
  const pdfOptions = {
    format: "A4" as "A4",
    border: {
      top: "1cm",
      right: "1cm",
      bottom: "1cm",
      left: "1cm"
    },
    timeout: 30000,
  };

  return new Promise((resolve, reject) => {
    htmlToPdf.create(htmlContent, pdfOptions).toBuffer((err, buffer) => {
      if (err) {
        console.error("Erro ao gerar o PDF:", err);
        reject(err);
      } else {
        resolve(buffer);
      }
    });
  });
}
/**
 * Gera o PDF do recibo com base no ID da declaração.
 * 
 * @param declaracaoId - O ID da declaração para a qual gerar o recibo.
 * @returns Uma promessa que resolve com o buffer do PDF do recibo gerado.
 * @throws Um erro se houver algum problema ao gerar o recibo.
 */
async function gerarPDFRecibo(declaracaoId: mongoose.Types.ObjectId): Promise<Buffer> {
  try {
    const declaracao = await buscaDeclaracao(declaracaoId);
    const museu = await buscaMuseu(declaracao.museu_id);
    const usuario = await buscaUsuario(museu.usuario);

    const dadosFormatados = formatarDadosRecibo(declaracao, museu, usuario);
    const htmlContent = await redenrizarTemplate(dadosFormatados);

    return await converterHtmlParaPdf(htmlContent);
  } catch (error) {
    console.error("Erro ao gerar o recibo:", error);
    throw new Error("Erro ao gerar o recibo.");
  }
}
export { gerarPDFRecibo };
