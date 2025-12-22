import pulse from "../lib/pulse";
import ExportacaoModel from "../models/Exportacao";
import ConfiguracaoPortalPublicoModel from "../models/Configuracao/portalPublico";

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
    console.error("Configuração do portal público não encontrada ao verificar status da exportação");
    return;
  }

  const credentials = Buffer.from(
    `${config.node_de_usuario}:${config.senha}`
  ).toString("base64");

  for (const exportacao of exportacoes) {
    if (!exportacao.sessoes) continue;

    const now = new Date();
    if (exportacao.iniciadoEm && (now.getTime() - new Date(exportacao.iniciadoEm).getTime() > 24 * 60 * 60 * 1000)) {
        exportacao.status = 'erro';
        exportacao.erro = "Tempo limite de exportação excedido.";
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
        console.error(`Erro ao verificar sessão ${sessao.id}:`, error);
      }
    }

    if (modified) {
      exportacao.markModified("sessoes");
      
      const allSessions = Object.values(sessoes).filter(s => s && typeof s === 'object');
      const anyRunning = allSessions.some((s: any) => s.status === "em_andamento");
      const anyError = allSessions.some((s: any) => s.status === "erro");

      if (!anyRunning) {
        if (anyError) {
          exportacao.status = "erro";
          exportacao.erro = "Erro em uma ou mais sessões de importação.";
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
