/* eslint-disable @typescript-eslint/no-explicit-any */
import pulse from "../lib/pulse"
import ExportacaoModel from "../models/Exportacao"
import ConfiguracaoPortalPublicoModel from "../models/Configuracao/portalPublico"

const EXPORT_TIMEOUT_MS = 2 * 60 * 60 * 1000 // 2 horas

type Sessao = {
  id: string
  bgProcessId?: string
  status: "em_andamento" | "concluida" | "erro"
}

pulse.define("checkExportStatus", async () => {
  const exportacoes = await ExportacaoModel.find({ status: "em_andamento" })

  if (exportacoes.length === 0) return

  const config = await ConfiguracaoPortalPublicoModel.findOne({
    key: "portalPublico"
  })
  if (!config) {
    console.error(
      "[checkExportStatus] Configuração do portal público não encontrada."
    )
    return
  }

  const credentials = Buffer.from(
    `${config.node_de_usuario}:${config.senha}`
  ).toString("base64")

  for (const exportacao of exportacoes) {
    if (!exportacao.sessoes) continue

    // Timeout: se passou mais de 2h sem concluir, marca como erro
    const now = new Date()
    if (
      exportacao.iniciadoEm &&
      now.getTime() - new Date(exportacao.iniciadoEm).getTime() >
        EXPORT_TIMEOUT_MS
    ) {
      exportacao.status = "erro"
      exportacao.erro =
        "Tempo limite de 2 horas excedido sem resposta final do Tainacan."
      exportacao.finalizadoEm = new Date()
      await exportacao.save()
      console.warn(
        `[checkExportStatus] Exportação ${exportacao._id} marcada como erro por timeout.`
      )
      continue
    }

    let modified = false
    const sessoes = exportacao.sessoes as Record<string, Sessao>

    for (const [, sessao] of Object.entries(sessoes)) {
      if (!sessao || sessao.status !== "em_andamento") continue

      try {
        // Usa bgProcessId se disponível (mais confiável), senão cai para sessão legada
        const usaBgProcess = !!sessao.bgProcessId
        const url = usaBgProcess
          ? `${config.url}/wp-json/tainacan/v2/bg-processes/${sessao.bgProcessId}`
          : `${config.url}/wp-json/tainacan/v2/importers/session/${sessao.id}`

        const res = await fetch(url, {
          method: "GET",
          headers: { Authorization: `Basic ${credentials}` }
        })

        if (res.ok) {
          const data = await res.json()

          if (
            data.status === "closed" ||
            data.status === "finished" ||
            data.status === "done" ||
            data.progress === 100
          ) {
            sessao.status = "concluida"
            modified = true
          } else if (["failed", "error", "cancelled"].includes(data.status)) {
            sessao.status = "erro"
            exportacao.erro =
              data.error_message ||
              `Tainacan abortou com status: ${data.status}`
            modified = true
          }
          // Se status=running ou open: não faz nada, aguarda próximo pulso
        } else if (res.status === 400 && !usaBgProcess) {
          // Sessão legada removida pelo Tainacan = job foi enfileirado
          // Não marca como concluida aqui — bgProcess já cuida disso
          const data = await res.json().catch(() => ({}))
          if (
            (data as any).error_message ===
            "Sessão de Importador não encontrada"
          ) {
            // Sessão sumiu mas não temos bgProcessId para confirmar — marca em_andamento
            // O timeout vai resolver se travar
            console.warn(
              `[checkExportStatus] Sessão ${sessao.id} não encontrada e sem bgProcessId. Aguardando...`
            )
          } else {
            sessao.status = "erro"
            exportacao.erro =
              (data as any).error_message || "Erro 400 ao checar sessão."
            modified = true
          }
        } else if (res.status === 401 || res.status === 403) {
          sessao.status = "erro"
          exportacao.erro = "Erro de autenticação ao checar status no Tainacan."
          modified = true
        } else if (res.status >= 500) {
          // Erro de servidor — não marca como erro definitivo, aguarda próximo pulso
          console.warn(
            `[checkExportStatus] Servidor Tainacan retornou HTTP ${res.status}. Tentando no próximo pulso.`
          )
        } else {
          sessao.status = "erro"
          exportacao.erro = `HTTP não tratado: ${res.status}`
          modified = true
        }
      } catch (error) {
        const isNetworkError =
          error instanceof Error &&
          (error.message.includes("fetch failed") ||
            error.message.includes("EAI_AGAIN") ||
            error.message.includes("ECONNRESET") ||
            error.message.includes("TIMEOUT"))

        if (isNetworkError) {
          // Oscilação de rede — ignora e tenta no próximo pulso
          console.warn(
            `[checkExportStatus] Oscilação de rede ao checar sessão/processo. Tentando no próximo pulso...`
          )
        } else {
          console.error(`[checkExportStatus] Erro crítico:`, error)
          sessao.status = "erro"
          exportacao.erro =
            error instanceof Error
              ? error.message
              : "Erro fatal no job de checagem."
          modified = true
        }
      }
    }

    if (modified) {
      exportacao.markModified("sessoes")
    }

    // Consolida o status pai com base em todas as sessões
    const allSessions = Object.values(sessoes).filter(
      (s): s is Sessao => !!s && typeof s === "object" && "status" in s
    )
    const anyRunning = allSessions.some((s) => s.status === "em_andamento")
    const anyError = allSessions.some((s) => s.status === "erro")

    if (!anyRunning) {
      // Todas as sessões terminaram
      if (anyError) {
        exportacao.status = "erro"
        if (!exportacao.erro)
          exportacao.erro = "Erro em uma ou mais sessões de importação."
        exportacao.finalizadoEm = new Date()
      } else {
        // Todas concluídas com sucesso — agora sim marca como concluida
        exportacao.status = "concluida"
        exportacao.finalizadoEm = new Date()
        exportacao.totalExportacoesConcluidas =
          (exportacao.totalExportacoesConcluidas || 0) + 1
        console.log(
          `[checkExportStatus] Exportação ${exportacao._id} CONCLUÍDA com sucesso.`
        )
      }
      await exportacao.save()
    } else if (modified) {
      await exportacao.save()
    }
  }
})
