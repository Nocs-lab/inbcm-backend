import mongoose from "mongoose";
import path from "path";
import PDFDocument from "pdfkit";
import { Declaracoes, Museu, ReciboModel, Usuario } from "../models";
import ejs from "ejs";
import htmlToPdf from "html-pdf";

async function gerarPDFRecibo(declaracaoId: mongoose.Types.ObjectId): Promise<Buffer> {
  try {
    const declaracao = await Declaracoes.findById(declaracaoId);
    if (!declaracao) {
      throw new Error(`Declaração não encontrada para o ID especificado: ${declaracaoId}`);
    }

    const museu = await Museu.findById(declaracao.museu_id);
    if (!museu) {
      throw new Error(`Museu não encontrado para o ID especificado: ${declaracao.museu_id}`);
    }

    const usuario = await Usuario.findById(museu.usuario);
    if (!usuario) {
      throw new Error(`Usuário não encontrado para o ID especificado: ${museu.usuario}`);
    }
    const totalBensDeclarados =
      (declaracao.arquivistico.quantidadeItens || 0) +
      (declaracao.bibliografico.quantidadeItens || 0) +
      (declaracao.museologico.quantidadeItens || 0);

    // Compile o template EJS com os dados
    const formatValue = (value: number): string => value === 0 ? '---' : value.toString();
    const templatePath = path.join(__dirname, "../templates/ejs/recibo.ejs");
    const htmlContent = await ejs.renderFile(templatePath, {
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
      bensArquivisticos: formatValue(declaracao.arquivistico.quantidadeItens)
    });

    // Configuração para a conversão de HTML para PDF
    const pdfOptions = {
      format: "A4", // ou qualquer outro formato suportado que desejar
      border: {
        top: "1cm",
        right: "1cm",
        bottom: "1cm",
        left: "1cm"
      },
      timeout: 30000,
    };

    // Converte o HTML para PDF
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

  } catch (error) {
    console.error("Erro ao gerar o recibo:", error);
    throw new Error("Erro ao gerar o recibo.");
  }
}

export { gerarPDFRecibo };
