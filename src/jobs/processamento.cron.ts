import cron from "node-cron"
import mongoose from "mongoose"
import { ProcessamentoJob } from "../models/ProcessamentoJob"
import { ProcessamentoDeclaracaoService } from "../service/ProcessamentoDeclaracaoService"
import logger from "../utils/logger"

const service = new ProcessamentoDeclaracaoService()
let rodando = false

export function iniciarCronProcessamento(): void {
  const intervalo = process.env.CRON_UPLOAD_INTERVAL || "*/2 * * * *"

  if (!cron.validate(intervalo)) {
    logger.error(`CRON_UPLOAD_INTERVAL inválido: "${intervalo}"`)
    return
  }

  cron.schedule(intervalo, async () => {
    if (rodando) {
      logger.info("Cron: execução anterior ainda em andamento, pulando")
      return
    }

    rodando = true

    try {
      const jobs = await ProcessamentoJob.find({
        status: "pending",
        tentativas: { $lt: 3 }
      })
        .sort({ criadoEm: 1 })
        .limit(10)

      if (jobs.length === 0) return

      logger.info(`Cron: processando ${jobs.length} job(s)`)

      for (const job of jobs) {
        try {
          await service.processarJob(
            (job._id as mongoose.Types.ObjectId).toString()
          )
        } catch (error) {
          logger.error(`Cron: erro no job ${job._id}:`, error)
        }
      }
    } catch (error) {
      logger.error("Cron: erro ao buscar jobs:", error)
    } finally {
      rodando = false
    }
  })

  logger.info(`Cron iniciado — intervalo: "${intervalo}"`)
}
