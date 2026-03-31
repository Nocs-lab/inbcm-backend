import { Declaracoes } from "../models"
import { ProcessamentoJob, IProcessamentoJob } from "../models/ProcessamentoJob"
import { Arquivistico, Bibliografico, Museologico } from "../models"
import { Status } from "../enums/Status"
import minioClient from "../db/minioClient"
import {
  validate_museologico,
  validate_arquivistico,
  validate_bibliografico
} from "inbcm-xlsx-validator"
import {
  arquivistico,
  bibliografico,
  museologico
} from "inbcm-xlsx-validator/schema"
import { calcularPercentuais } from "../utils/calcularPercentual"
import { salvarPendenciasEmChunks } from "../utils/declaracaoUtils"
import { sendEmail } from "../emails"
import { DataUtils } from "../utils/dataUtils"
import { MuseuHelper } from "../utils/museuHelper"
import { AnoDeclaracao } from "../models/AnoDeclaracao"
import config from "../config"
import logger from "../utils/logger"

type TipoArquivo = "arquivistico" | "bibliografico" | "museologico"

export class ProcessamentoDeclaracaoService {
  async processarJob(jobId: string): Promise<void> {
    const job = await ProcessamentoJob.findById(jobId)
    if (!job) throw new Error(`Job ${jobId} não encontrado`)

    job.status = "processing"
    job.processadoEm = new Date()
    job.tentativas += 1
    await job.save()

    try {
      const declaracao = await Declaracoes.findById(job.declaracaoId)
      if (!declaracao) throw new Error("Declaração não encontrada")

      const tipos: TipoArquivo[] = [
        "arquivistico",
        "bibliografico",
        "museologico"
      ]

      for (const tipo of tipos) {
        const arquivo = declaracao[tipo]
        if (!arquivo?.nome) continue
        await this.processarTipo(declaracao, tipo, arquivo.nome)
      }

      declaracao.status = Status.Recebida
      await declaracao.save()

      job.status = "completed"
      job.concluidoEm = new Date()
      await job.save()

      await this.enviarEmailConclusao(declaracao, job.tipo)

      logger.info(`Job ${jobId} processado com sucesso`)
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : String(error)
      job.erros.push(mensagem)

      if (job.tentativas >= job.maxTentativas) {
        job.status = "failed"
        job.concluidoEm = new Date()
        await job.save()

        await this.enviarEmailFalha(job).catch((e) =>
          logger.error("Erro ao enviar email de falha:", e)
        )

        logger.error(
          `Job ${jobId} falhou após ${job.tentativas} tentativas: ${mensagem}`
        )
      } else {
        job.status = "pending"
        await job.save()
        logger.warn(
          `Job ${jobId} falhou na tentativa ${job.tentativas}, será retentado`
        )
      }

      throw error
    }
  }

  private async enviarEmailConclusao(
    declaracao: any,
    tipo: "upload" | "retificacao"
  ): Promise<void> {
    try {
      const emails = await MuseuHelper.getEmailsFromMuseuUsers(
        declaracao.museu_id.toString()
      )
      const anoDoc = await AnoDeclaracao.findById(declaracao.anoDeclaracao)
      const anoReferencia = anoDoc ? anoDoc.ano.toString() : "N/A"

      const totalItens =
        (declaracao.museologico?.quantidadeItens || 0) +
        (declaracao.arquivistico?.quantidadeItens || 0) +
        (declaracao.bibliografico?.quantidadeItens || 0)

      const template =
        tipo === "retificacao"
          ? "retificacao-processada"
          : "declaracao-processada"

      await sendEmail(template, emails, {
        museu: declaracao.museu_nome,
        anoReferencia,
        totalItens,
        hash: declaracao.hashDeclaracao,
        url: config.PUBLIC_SITE_URL
      })
    } catch (error) {
      logger.error("Erro ao enviar email de conclusão:", error)
    }
  }

  private async enviarEmailFalha(job: IProcessamentoJob): Promise<void> {
    const declaracao = await Declaracoes.findById(job.declaracaoId)
    if (!declaracao) return

    const emails = await MuseuHelper.getEmailsFromMuseuUsers(
      declaracao.museu_id.toString()
    )
    const anoDoc = await AnoDeclaracao.findById(declaracao.anoDeclaracao)
    const anoReferencia = anoDoc ? anoDoc.ano.toString() : "N/A"

    await sendEmail("declaracao-falha-processamento", emails, {
      museu: declaracao.museu_nome,
      anoReferencia,
      hash: declaracao.hashDeclaracao,
      url: config.PUBLIC_SITE_URL
    })
  }

  private async processarTipo(
    declaracao: any,
    tipo: TipoArquivo,
    objectPath: string
  ): Promise<void> {
    const bucketName = process.env.MINIO_BUCKET || "inbcm"

    const stream = await minioClient.getObject(bucketName, objectPath)
    const buffer = await this.streamToBuffer(stream)

    let validate: (buf: Buffer) => Promise<any>
    let requiredFields: string[]
    let Modelo: typeof Arquivistico | typeof Bibliografico | typeof Museologico

    switch (tipo) {
      case "arquivistico":
        validate = validate_arquivistico
        requiredFields = arquivistico.required
        Modelo = Arquivistico
        break
      case "bibliografico":
        validate = validate_bibliografico
        requiredFields = bibliografico.required
        Modelo = Bibliografico
        break
      case "museologico":
        validate = validate_museologico
        requiredFields = museologico.required
        Modelo = Museologico
        break
    }

    const {
      data: arquivoData,
      detailedErrors,
      naoEncontrados
    } = await validate(buffer)

    const errosPorLinha = new Map<number, Record<string, string>>()

    for (const [linha, campos] of detailedErrors) {
      if (!errosPorLinha.has(linha)) errosPorLinha.set(linha, {})
      const entry = errosPorLinha.get(linha)!
      for (const campo of campos) {
        entry[campo] = "Campo vazio"
      }
    }

    for (const linha of naoEncontrados) {
      if (!errosPorLinha.has(linha)) errosPorLinha.set(linha, {})
      errosPorLinha.get(linha)!["situacao"] = "Não localizado"
    }

    const detailedErrorsFinal = Array.from(
      errosPorLinha,
      ([linha, camposComErro]) => ({
        linha,
        camposComErro
      })
    )

    await salvarPendenciasEmChunks({
      declaracaoId: declaracao._id,
      tipoArquivo: tipo,
      erros: detailedErrorsFinal
    })

    const {
      porcentagemGeral,
      porcentagemPorCampo,
      errors: camposObrigatorios
    } = calcularPercentuais(arquivoData, requiredFields)

    if (
      detailedErrorsFinal.some(
        (e) => e.camposComErro["identificador"] === "Não localizado"
      ) &&
      !camposObrigatorios.includes("situacao")
    ) {
      camposObrigatorios.push("situacao")
    }

    declaracao[tipo] = {
      ...declaracao[tipo],
      status: declaracao.status,
      pendencias: camposObrigatorios,
      quantidadeItens: arquivoData.length,
      porcentagemGeral,
      porcentagemPorCampo
    }

    arquivoData.forEach((item: any) => {
      item.declaracao_ref = declaracao._id
      item.versao = declaracao.versao
    })

    await Modelo.insertMany(arquivoData)
  }

  private streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []
      stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)))
      stream.on("end", () => resolve(Buffer.concat(chunks)))
      stream.on("error", reject)
    })
  }
}
