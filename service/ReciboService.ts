import mongoose from "mongoose";
import path from "path";
import { DeclaracaoModel, Declaracoes,Museu,Usuario} from "../models";
import ejs from "ejs";
import htmlToPdf from "html-pdf";
import { IMuseu } from '../models/Museu';
import { IUsuario } from '../models/Usuario';
import { ReciboDados } from "../types/DadosRecibo";


async function getDeclaracao(declaracaoId:mongoose.Types.ObjectId){
    const declaracao = await Declaracoes.findById(declaracaoId);
    if (!declaracao) {
      throw new Error(`Declaração não encontrada para o ID especificado: ${declaracaoId}`);
    }
    return declaracao
}
async function getMuseu(museuId:mongoose.Types.ObjectId){
  const museu = await Museu.findById(museuId);
  if (!museu) {
    throw new Error(`Museu não encontrado para o ID especificado: ${museuId}`);
  }
  return museu;
}
async function getUsuario(usuarioId:mongoose.Types.ObjectId){
  const usuario = await Usuario.findById(usuarioId);
  if (!usuario) {
    throw new Error(`Usuário não encontrado para o ID especificado: ${usuarioId}`);
  }
  return usuario;
}
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
async function redenrizarTemplate(dados:ReciboDados){
  const templatePath = path.join(__dirname, "../templates/ejs/recibo.ejs");
  return await ejs.renderFile(templatePath, dados);
}
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
async function gerarPDFRecibo(declaracaoId: mongoose.Types.ObjectId): Promise<Buffer> {
  try {
    const declaracao = await getDeclaracao(declaracaoId);
    const museu = await getMuseu(declaracao.museu_id);
    const usuario = await getUsuario(museu.usuario);

    const dadosFormatados = formatarDadosRecibo(declaracao, museu, usuario);
    const htmlContent = await redenrizarTemplate(dadosFormatados);

    return await converterHtmlParaPdf(htmlContent);
  } catch (error) {
    console.error("Erro ao gerar o recibo:", error);
    throw new Error("Erro ao gerar o recibo.");
  }
}
export { gerarPDFRecibo };
