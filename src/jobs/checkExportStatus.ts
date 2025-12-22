import pulse from "../lib/pulse";
import ExportacaoModel from "../models/Exportacao";
import ConfiguracaoPortalPublicoModel from "../models/Configuracao/portalPublico";

const EXPORT_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24 hours

type Sessao = {
  id?: string | number;
  status: string;
};

pulse.define("checkExportStatus", async (_job) => {
  const exportacoes = await ExportacaoModel.find({
    status: "em_andamento",
  });

  if (exportacoes.length === 0) {
    return;
  }

  const config = await ConfiguracaoPortalPublicoModel.findOne({
    key: "portalPublico",
  });

  if (!config) {
    console.error("Public portal configuration not found when checking export status");
    return;
  }

  const credentials = Buffer.from(
    `${config.node_de_usuario}:${config.senha}`
  ).toString("base64");

  for (const exportacao of exportacoes) {
    if (!exportacao.sessoes) continue;

    const now = new Date();
    if (exportacao.iniciadoEm && (now.getTime() - new Date(exportacao.iniciadoEm).getTime() > EXPORT_TIMEOUT_MS)) {
        exportacao.status = 'erro';
        exportacao.erro = "Export timeout exceeded.";
        await exportacao.save();
        continue;
    }

    let modified = false;
    const sessoes = exportacao.sessoes;
    const types = ["museologico", "bibliografico", "arquivistico"] as const;

    for (const tipo of types) {
      const sessao = sessoes[tipo];
      if (!sessao || sessao.status !== "em_andamento") {
        continue;
      }

      try {
        const res = await fetch(
          `${config.url}/wp-json/tainacan/v2/importers/session/${sessao.id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Basic ${credentials}`,
            },
          }
        );

        if (res.status === 400) {
          const data = await res.json();
          if (data.error_message === "Sessão de Importador não encontrada") {
            sessao.status = "concluida";
            modified = true;
          }
        }
      } catch (error) {
        console.error(`Error checking session ${sessao.id}:`, error);
        sessao.status = "erro";
        modified = true;
      }
    }

    if (modified) {
      exportacao.markModified("sessoes");
      
      const allSessions = Object.values(sessoes).filter(
        (s): s is Sessao => !!s && typeof s === "object" && "status" in s
      );
      const anyRunning = allSessions.some((s) => s.status === "em_andamento");
      const anyError = allSessions.some((s) => s.status === "erro");

      if (!anyRunning) {
        if (anyError) {
          exportacao.status = "erro";
          exportacao.erro = "Error in one or more import sessions.";
        } else {
          exportacao.status = "concluida";
          exportacao.finalizadoEm = new Date();
          exportacao.totalExportacoesConcluidas = (exportacao.totalExportacoesConcluidas || 0) + 1;
        }
      }
      
      await exportacao.save();
    }
  }
});
