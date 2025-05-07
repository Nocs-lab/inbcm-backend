import { Request, Response } from "express";
import Importacao from "../models/Importacao";
import { Museu } from "../models";
import MuseuService from "../service/MuseuService";
import logger from "../utils/logger";
import mongoose from "mongoose";
import HTTPError from "../utils/error";

export class ImportacaoController {
  static async iniciarImportacao(req: Request, res: Response) {

    const usuarioId = req.user.id
    const emAndamento = await Importacao.findOne({ status: "em_andamento" })
    .sort({ iniciadoEm: -1 })
    .populate("usuario", "nome email")
    .lean();

    if (emAndamento && emAndamento.usuario && typeof emAndamento.usuario === "object") {
        const usuario = emAndamento.usuario as any;
      
        const iniciadoEmFormatado = new Date(emAndamento.iniciadoEm).toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          dateStyle: "short",
          timeStyle: "short"
        });
      
        throw new HTTPError(
            `Uma importação foi iniciada em ${iniciadoEmFormatado.split(',')[0]} às ${iniciadoEmFormatado.split(',')[1]}, por ${usuario.nome} (${usuario.email}). Aguarde a conclusão antes de iniciar uma nova.`,
            409
          );
      }
      
    const importacao = new Importacao({
      status: "em_andamento",
      iniciadoEm: new Date(),
      usuario: usuarioId
    });

    await importacao.save();

    res.status(202).json({ message: "Importação iniciada", importacaoId: importacao._id });

    setImmediate(async () => {
        if (mongoose.connection.readyState !== 1) {
            logger.warn("Banco de dados ainda não está conectado. Aguardando para iniciar a importação.");
            return;
          }
        logger.info("Iniciando tarefa em segundo plano..."); 
        try {
          const importacaoAtual = await Importacao.findById(importacao._id);
          if (!importacaoAtual) {
            logger.error("Importação não encontrada após o início.");
            return;
          }
      
          const resultado = await MuseuService.fetchAndSaveMuseusPaginated();
      
          importacaoAtual.status = "concluida";
          importacaoAtual.finalizadoEm = new Date();
          importacaoAtual.numeroImportados = resultado.inserted;
          importacaoAtual.museusCadastrados = await Museu.countDocuments();
          
          const totalConcluidas = await Importacao.countDocuments({ status: "concluida" });

          importacaoAtual.totalImportacoesConcluidas = totalConcluidas + 1;
      
          await importacaoAtual.save();
         
          logger.info(`Total de importações concluídas: ${totalConcluidas}`);
          logger.info("Importação concluída.");
        } catch (err: any) {
          const importacaoErro = await Importacao.findById(importacao._id);
          
          if (importacaoErro) {
            importacaoErro.status = "erro";
            importacaoErro.finalizadoEm = new Date();
            importacaoErro.erro = err.message;
            await importacaoErro.save();
          }
          logger.error("Erro na importação:", err);
        }
      });
      
  }
  
  static async getUltimaImportacao(req: Request, res: Response) {
    const ultima = await Importacao.findOne({ status: "concluida" })
      .sort({ finalizadoEm: -1 })
      .populate("usuario", "nome email") // Popula o campo 'usuario' com 'nome' e 'email'
      .lean();
  
    if (!ultima) {
      return res.status(404).json({ message: "Nenhuma importação concluída encontrada." });
    }
  
    // Devolver a resposta com os dados da importação e usuário populado
    res.json(ultima);
  }
  

  static async getContagemMuseus(req: Request, res: Response) {
    const total = await Museu.countDocuments();
    res.json({ museusCadastrados: total });
  }

 
  static async getStatusImportacao(req: Request, res: Response) {
    const { importacaoId } = req.params;

    const importacao = await Importacao.findById(importacaoId)
      .populate<{ usuario: { nome: string; email: string } }>("usuario", "nome email")
      .lean();

    if (!importacao) {
      return res.status(404).json({ message: "Importação não encontrada." });
    }

    let mensagem = "";
    const dataHoraFormatada = new Date(importacao.iniciadoEm).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
      dateStyle: "short",
      timeStyle: "short"
    });

    switch (importacao.status) {
      case "em_andamento":
        const [data, hora] = dataHoraFormatada.split(",");
        mensagem = `Uma importação foi iniciada em ${data.trim()} às${hora}, por ${importacao.usuario.nome} (${importacao.usuario.email})`;
        break;
      case "concluida":
        mensagem = `Importação concluída em ${new Date(importacao.finalizadoEm!).toLocaleString("pt-BR", {
          timeZone: "America/Sao_Paulo",
          dateStyle: "short",
          timeStyle: "short"
        })}`;
        break;
      case "erro":
        mensagem = `Importação falhou com erro: ${importacao.erro || "Erro desconhecido."}`;
        break;
      default:
        mensagem = "Status da importação desconhecido.";
    }

    return res.json({
      status: importacao.status,
      mensagem,
      importacaoId: importacao._id,
      usuario: importacao.usuario,
    });
  }
}
  
