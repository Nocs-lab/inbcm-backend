import mongoose from "mongoose";
import path from "path";
import ejs from "ejs";
import puppeteer from "puppeteer";
import Declaracoes from "../models/Declaracao";
import Museu from "../models/Museu";


interface DadosBensDeclarados {
  totalBensDeclarados: number;
  bensMuseologicos: number;
  bensBibliograficos: number;
  bensArquivisticos: number;
}

async function emitirReciboDeclaracao(
  declaracaoId: mongoose.Types.ObjectId,
  anoCalendario: number,
  dataCallback: (chunk: any) => void,
  endCallback: () => void
): Promise<void> {
  try {
    const declaracao = await Declaracoes.findById(declaracaoId).populate("museu");
    if (!declaracao) {
      throw new Error(`Declaração não encontrada para o ID especificado: ${declaracaoId}`);
    }

    const museu = await Museu.findById(declaracao.museu_id);
    if (!museu) {
      throw new Error(`Museu não encontrado para o ID especificado: ${declaracao.museu_id}`);
    }

    const templatePath = path.join(__dirname, "../templates/ejs/recibo.ejs");
    console.log(` caminho do arquivo ${templatePath}`)
    const dataEnvio = new Date().toLocaleString("pt-BR");
    const dadosRecibo = {
      anoCalendario: anoCalendario,
      codigoIdentificador: museu._id.toString(),
      nomeMuseu: museu.nome,
      logradouro: museu.endereco.logradouro,
      numero: museu.endereco.numero,
      complemento: museu.endereco.complemento,
      bairro: museu.endereco.bairro,
      cep: museu.endereco.cep,
      municipio: museu.endereco.municipio,
      uf: museu.endereco.uf,    
      // totalBensDeclarados: dadosBensDeclarados.totalBensDeclarados,
      // bensMuseologicos: dadosBensDeclarados.bensMuseologicos,
      // bensBibliograficos: dadosBensDeclarados.bensBibliograficos,
      // bensArquivisticos: dadosBensDeclarados.bensArquivisticos,
      nomeDeclarante: declaracao.responsavelEnvio,
      horaData: dataEnvio,
      numeroRecibo: declaracao.hashDeclaracao,
    };

    const html = await ejs.renderFile(templatePath, dadosRecibo);

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdfBuffer = await page.pdf({ format: "A4" });
    await browser.close();

    dataCallback(pdfBuffer);
    endCallback();
   
  } catch (error) {
    console.error("Erro ao emitir recibo de declaração:", error);
    throw error;
  }
}

export { emitirReciboDeclaracao };