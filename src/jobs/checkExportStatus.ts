import pulse from "../lib/pulse"
import ExportacaoModel from "../models/Exportacao"
import ConfiguracaoPortalPublicoModel from "../models/Configuracao/portalPublico"

const EXPORT_TIMEOUT_MS = 1 * 60 * 60 * 1000 // Reduzido para 1 hora (limite justo para não travar o sistema)

type Sessao = {
  id: string
  status: "em_andamento" | "concluida" | "erro"
}

pulse.define("checkExportStatus", async () => {
  const exportacoes = await ExportacaoModel.find({
    status: "em_andamento"
  })

  if (exportacoes.length === 0) {
    return
  }

  const config = await ConfiguracaoPortalPublicoModel.findOne({
    key: "portalPublico"
  })

  if (!config) {
    console.error(
      "Configuração do portal público não encontrada ao checar status."
    )
    return
  }

  const credentials = Buffer.from(
    `${config.node_de_usuario}:${config.senha}`
  ).toString("base64")

  for (const exportacao of exportacoes) {
    if (!exportacao.sessoes) continue

    const now = new Date()
    if (
      exportacao.iniciadoEm &&
      now.getTime() - new Date(exportacao.iniciadoEm).getTime() >
        EXPORT_TIMEOUT_MS
    ) {
      exportacao.status = "erro"
      exportacao.erro =
        "Tempo limite da exportação (1 hora) excedido sem resposta final do Tainacan."
      await exportacao.save()
      continue
    }

    let modified = false
    const sessoes = exportacao.sessoes as Record<string, Sessao>

    for (const [, sessao] of Object.entries(sessoes)) {
      if (!sessao || sessao.status !== "em_andamento") {
        continue
      }

      try {
        const res = await fetch(
          `${config.url}/wp-json/tainacan/v2/importers/session/${sessao.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Basic ${credentials}`
            }
          }
        )

        // 1. Tainacan respondeu com Sucesso (Pode ser que o job de importação ainda esteja rodando ou já terminou)
        if (res.ok) {
          const data = await res.json()

          if (
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
              `Tainacan abortou a sessão com o status: ${data.status}`
            modified = true
          }
          // Nota: Se for 'running' ou 'queued', não fazemos nada. Continua 'em_andamento'.

          // 2. Erro 400 - O Tainacan costuma apagar a sessão quando ela termina com sucesso
        } else if (res.status === 400) {
          const data = await res.json()
          if (data.error_message === "Sessão de Importador não encontrada") {
            sessao.status = "concluida"
            modified = true
          } else {
            sessao.status = "erro"
            exportacao.erro =
              data.error_message ||
              "Erro 400: Requisição inválida ao checar sessão."
            modified = true
          }

          // 3. Erro 401 ou 403 - A senha de aplicação ou usuário estão errados
        } else if ([401, 403].includes(res.status)) {
          sessao.status = "erro"
          exportacao.erro =
            "Erro 401/403: Falha de autenticação ao tentar checar o status no Tainacan."
          modified = true

          // 4. Erro 500+ - O servidor do IFRN (WordPress) deu erro fatal (Ex: estourou memória, bug PHP)
        } else if (res.status >= 500) {
          sessao.status = "erro"
          exportacao.erro = `O servidor do Tainacan caiu ou retornou erro interno (HTTP ${res.status}).`
          modified = true

          // 5. Outros erros HTTP (Ex: 404)
        } else {
          sessao.status = "erro"
          exportacao.erro = `O servidor retornou um erro HTTP não tratado: ${res.status}`
          modified = true
        }
      } catch (error) {
        // 6. TRATAMENTO DE REDE (Falhas temporárias não cancelam a exportação)
        const isNetworkError =
          error instanceof Error &&
          (error.message.includes("fetch failed") ||
            error.message.includes("EAI_AGAIN") ||
            error.message.includes("ECONNRESET") ||
            error.message.includes("TIMEOUT"))

        if (isNetworkError) {
          console.warn(
            `[Aviso de Rede] A internet oscilou ou o DNS falhou ao checar a sessão ${sessao.id}. Tentando novamente no próximo pulso...`
          )
          // Não setamos modified = true nem mudamos status, apenas esperamos o próximo Job rodar.
        } else {
          console.error(`Erro crítico ao checar sessão ${sessao.id}:`, error)
          sessao.status = "erro"
          exportacao.erro =
            error instanceof Error
              ? error.message
              : "Erro desconhecido e fatal no Job de checagem."
          modified = true
        }
      }
    }

    // Se houve mudança de status em qualquer sessão, consolida o resultado da Exportação Pai
    if (modified) {
      exportacao.markModified("sessoes")

      const allSessions = Object.values(sessoes).filter(
        (s): s is Sessao => !!s && typeof s === "object" && "status" in s
      )
      const anyRunning = allSessions.some((s) => s.status === "em_andamento")
      const anyError = allSessions.some((s) => s.status === "erro")

      if (!anyRunning) {
        if (anyError) {
          exportacao.status = "erro"
          // O detalhe do erro já foi populado nas condições acima
          if (!exportacao.erro)
            exportacao.erro = "Erro em uma ou mais sessões de importação."
        } else {
          exportacao.status = "concluida"
          exportacao.finalizadoEm = new Date()
          exportacao.totalExportacoesConcluidas =
            (exportacao.totalExportacoesConcluidas || 0) + 1
        }
      }

      await exportacao.save()
    }
  }
})
