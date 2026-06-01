/* eslint-disable @typescript-eslint/no-explicit-any */
import mongoose, { ObjectId } from "mongoose"
import { Declaracoes } from "../models"
import ConfiguracaoPortalPublicoModel from "../models/Configuracao/portalPublico"
import ExportacaoModel from "../models/Exportacao"
import BemCultural from "../models/BemCultural"
import archiver from "archiver"

type TainacanField = {
  name: string
  description: string
  related_mapped_prop: boolean
  options: unknown[]
  className: string
  core: boolean
  component: string
  primitive_type: string
  form_component: string
  preview_template: string
  sortable: boolean
}

type FieldsDefinition = { id: string; name: string; type: TainacanField }[]

const tainacanFields: Record<string, TainacanField> = {
  texto: {
    name: "Texto simples",
    description: "Uma caixa de texto simples, de uma linha",
    related_mapped_prop: false,
    options: [],
    className: "Tainacan\\Metadata_Types\\Text",
    core: false,
    component: "tainacan-text",
    primitive_type: "string",
    form_component: "tainacan-form-text",
    preview_template:
      '\n\t\t\t<div>\n\t\t\t\t<div class="control is-clearfix">\n\t\t\t\t\t<input type="text" placeholder="Type here..." class="input"> \n\t\t\t\t</div>\n\t\t\t</div>\n\t\t',
    sortable: true
  }
}

const museologicoFields: FieldsDefinition = [
  { id: "nderegistro", name: "Número de Registro", type: tainacanFields.texto },
  { id: "outrosnumeros", name: "Outros Números", type: tainacanFields.texto },
  { id: "situacao", name: "Situação", type: tainacanFields.texto },
  { id: "denominacao", name: "Denominação", type: tainacanFields.texto },
  { id: "titulo", name: "Título", type: tainacanFields.texto },
  { id: "autor", name: "Autor", type: tainacanFields.texto },
  { id: "classificacao", name: "Classificação", type: tainacanFields.texto },
  {
    id: "resumodescritivo",
    name: "Resumo Descritivo",
    type: tainacanFields.texto
  },
  { id: "dimensoes", name: "Dimensões", type: tainacanFields.texto },
  {
    id: "materialtecnica",
    name: "Material/Técnica",
    type: tainacanFields.texto
  },
  {
    id: "estadodeconservacao",
    name: "Estado de Conservação",
    type: tainacanFields.texto
  },
  {
    id: "localdeproducao",
    name: "Local de Produção",
    type: tainacanFields.texto
  },
  {
    id: "datadeproducao",
    name: "Data de Produção",
    type: tainacanFields.texto
  },
  {
    id: "condicoesdereproducao",
    name: "Condições de Reprodução",
    type: tainacanFields.texto
  },
  {
    id: "midiasrelacionadas",
    name: "Mídias Relacionadas",
    type: tainacanFields.texto
  },
  {
    id: "museu",
    name: "Museu",
    type: tainacanFields.texto
  }
]

const bibliograficoFields: FieldsDefinition = [
  { id: "nderegistro", name: "Número de Registro", type: tainacanFields.texto },
  { id: "outrosnumeros", name: "Outros Números", type: tainacanFields.texto },
  { id: "situacao", name: "Situação", type: tainacanFields.texto },
  { id: "titulo", name: "Título", type: tainacanFields.texto },
  { id: "tipo", name: "Tipo", type: tainacanFields.texto },
  {
    id: "identificacaoderesponsabilidade",
    name: "Identificação de Responsabilidade",
    type: tainacanFields.texto
  },
  { id: "editora", name: "Editora", type: tainacanFields.texto },
  {
    id: "datadeproducao",
    name: "Data de Produção",
    type: tainacanFields.texto
  },
  { id: "dimensaofisica", name: "Dimensão Física", type: tainacanFields.texto },
  {
    id: "materialtecnica",
    name: "Material/Técnica",
    type: tainacanFields.texto
  },
  { id: "encadernacao", name: "Encadernação", type: tainacanFields.texto },
  {
    id: "resumodescritivo",
    name: "Resumo Descritivo",
    type: tainacanFields.texto
  },
  {
    id: "estadodeconservacao",
    name: "Estado de Conservação",
    type: tainacanFields.texto
  },
  {
    id: "assuntoprincipal",
    name: "Assunto Principal",
    type: tainacanFields.texto
  },
  {
    id: "assuntocronologico",
    name: "Assunto Cronológico",
    type: tainacanFields.texto
  },
  {
    id: "assuntogeografico",
    name: "Assunto Geográfico",
    type: tainacanFields.texto
  },
  {
    id: "condicoesdereproducao",
    name: "Condições de Reprodução",
    type: tainacanFields.texto
  },
  {
    id: "midiasrelacionadas",
    name: "Mídias Relacionadas",
    type: tainacanFields.texto
  },
  {
    id: "museu",
    name: "Museu",
    type: tainacanFields.texto
  }
]

const arquivisticoFields: FieldsDefinition = [
  { id: "nderegistro", name: "Número de Registro", type: tainacanFields.texto },
  {
    id: "coddereferencia",
    name: "Código de Referência",
    type: tainacanFields.texto
  },
  { id: "titulo", name: "Título", type: tainacanFields.texto },
  { id: "data", name: "Data", type: tainacanFields.texto },
  {
    id: "niveldedescricao",
    name: "Nível de Descrição",
    type: tainacanFields.texto
  },
  {
    id: "dimensaoesuporte",
    name: "Dimensão e Suporte",
    type: tainacanFields.texto
  },
  {
    id: "nomedoprodutor",
    name: "Nome do Produtor",
    type: tainacanFields.texto
  },
  {
    id: "historiaadministrativabiografia",
    name: "História Administrativa/Biografia",
    type: tainacanFields.texto
  },
  {
    id: "historiaarquivistica",
    name: "História Arquivística",
    type: tainacanFields.texto
  },
  { id: "procedencia", name: "Procedência", type: tainacanFields.texto },
  {
    id: "ambitoeconteudo",
    name: "Âmbito e Conteúdo",
    type: tainacanFields.texto
  },
  {
    id: "sistemadearranjo",
    name: "Sistema de Arranjo",
    type: tainacanFields.texto
  },
  {
    id: "condicoesdereproducao",
    name: "Condições de Reprodução",
    type: tainacanFields.texto
  },
  {
    id: "existenciaelocalizacaodosoriginais",
    name: "Existência e Localização dos Originais",
    type: tainacanFields.texto
  },
  {
    id: "notassobreconservacao",
    name: "Notas sobre Conservação",
    type: tainacanFields.texto
  },
  {
    id: "pontosdeacessoeindexacaodeassuntos",
    name: "Pontos de Acesso e Indexação de Assuntos",
    type: tainacanFields.texto
  },
  {
    id: "midiasrelacionadas",
    name: "Mídias Relacionadas",
    type: tainacanFields.texto
  },
  {
    id: "museu",
    name: "Museu",
    type: tainacanFields.texto
  }
]

export default class ExportadorService {
  private async obterItensPorTipo(
    declaracoes: Array<any>
  ): Promise<Array<{ _id: string; items: any[] }>> {
    if (!declaracoes || declaracoes.length === 0) return []

    const declaracaoIds = declaracoes.map((d) => d._id)

    const maxVersoes = await BemCultural.aggregate([
      { $match: { declaracao_ref: { $in: declaracaoIds } } },
      {
        $group: {
          _id: { declaracao_ref: "$declaracao_ref", tipo: "$__t" },
          maxVersao: { $max: "$versao" }
        }
      }
    ])

    if (maxVersoes.length === 0) return []

    const orConditions = maxVersoes.map((mv) => ({
      declaracao_ref: mv._id.declaracao_ref,
      __t: mv._id.tipo,
      versao: mv.maxVersao
    }))

    const itens = await BemCultural.aggregate([
      { $match: { $or: orConditions } },
      {
        $group: {
          _id: "$__t",
          items: { $push: "$$ROOT" }
        }
      }
    ])

    return itens
  }

  async criarColecoes(exportacaoId: string): Promise<void> {
    const config = await ConfiguracaoPortalPublicoModel.findOne({
      key: "portalPublico"
    })

    if (!config) {
      throw new Error("Configuração do portal público não encontrada")
    }

    const exportacao = await ExportacaoModel.findById(exportacaoId)
    if (!exportacao) {
      throw new Error("Exportação não encontrada")
    }

    const exportacaoAnterior = await ExportacaoModel.findOne({
      ano: exportacao.ano,
      colecoesCriadas: true,
      _id: { $ne: exportacao._id }
    })

    if (exportacaoAnterior && exportacaoAnterior.colecoes) {
      exportacao.colecoes = exportacaoAnterior.colecoes
      exportacao.mapeamento = exportacaoAnterior.mapeamento
      exportacao.colecoesCriadas = true
      await exportacao.save()
      return
    }

    let anoLabel = "Sem_Ano"
    if (exportacao.ano) {
      const anoDoc = await mongoose.connection.db
        .collection("anodeclaracoes")
        .findOne({ _id: exportacao.ano })
      if (anoDoc && anoDoc.ano) {
        anoLabel = String(anoDoc.ano)
      }
    }

    const credentials = Buffer.from(
      `${config.node_de_usuario}:${config.senha}`
    ).toString("base64")

    const [res1, res2, res3] = await Promise.all([
      fetch(`${config.url}/wp-json/tainacan/v2/collections/?context=edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`
        },
        body: JSON.stringify({
          name: `Museológico - ${anoLabel}`,
          description: "",
          enable_cover_page: "no",
          cover_page_id: "",
          slug: "",
          status: "publish",
          parent: 0,
          enabled_view_modes: ["table", "cards", "masonry"],
          default_view_mode: "table",
          default_order: "ASC",
          default_orderby: "date",
          allows_submission: "no",
          submission_anonymous_user: "no",
          submission_default_status: "draft",
          submission_use_recaptcha: "no",
          allow_comments: "closed",
          allow_item_slug_editing: "no",
          allow_item_author_editing: "no",
          hide_items_thumbnail_on_lists: "no",
          item_enabled_document_types: {
            attachment: {
              enabled: "yes",
              label: "Arquivo",
              icon: "attachments"
            },
            url: { enabled: "yes", label: "URL", icon: "url" },
            text: { enabled: "yes", label: "Texto simples", icon: "text" }
          },
          item_publication_label: "Data da publicação",
          item_document_label: "Documento",
          item_thumbnail_label: "Miniatura",
          item_enable_thumbnail: "yes",
          item_attachment_label: "Anexos",
          item_enable_attachments: "yes",
          item_enable_metadata_focus_mode: "yes",
          item_enable_metadata_required_filter: "yes",
          item_enable_metadata_searchbar: "yes",
          item_enable_metadata_collapses: "yes",
          item_enable_metadata_enumeration: "no"
        })
      }),
      fetch(`${config.url}/wp-json/tainacan/v2/collections/?context=edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`
        },
        body: JSON.stringify({
          name: `Bibliográfico - ${anoLabel}`,
          description: "",
          enable_cover_page: "no",
          cover_page_id: "",
          slug: "",
          status: "publish",
          parent: 0,
          enabled_view_modes: ["table", "cards", "masonry"],
          default_view_mode: "table",
          default_order: "ASC",
          default_orderby: "date",
          allows_submission: "no",
          submission_anonymous_user: "no",
          submission_default_status: "draft",
          submission_use_recaptcha: "no",
          allow_comments: "closed",
          allow_item_slug_editing: "no",
          allow_item_author_editing: "no",
          hide_items_thumbnail_on_lists: "no",
          item_enabled_document_types: {
            attachment: {
              enabled: "yes",
              label: "Arquivo",
              icon: "attachments"
            },
            url: { enabled: "yes", label: "URL", icon: "url" },
            text: { enabled: "yes", label: "Texto simples", icon: "text" }
          },
          item_publication_label: "Data da publicação",
          item_document_label: "Documento",
          item_thumbnail_label: "Miniatura",
          item_enable_thumbnail: "yes",
          item_attachment_label: "Anexos",
          item_enable_attachments: "yes",
          item_enable_metadata_focus_mode: "yes",
          item_enable_metadata_required_filter: "yes",
          item_enable_metadata_searchbar: "yes",
          item_enable_metadata_collapses: "yes",
          item_enable_metadata_enumeration: "no"
        })
      }),
      fetch(`${config.url}/wp-json/tainacan/v2/collections/?context=edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`
        },
        body: JSON.stringify({
          name: `Arquivístico - ${anoLabel}`,
          description: "",
          enable_cover_page: "no",
          cover_page_id: "",
          slug: "",
          status: "publish",
          parent: 0,
          enabled_view_modes: ["table", "cards", "masonry"],
          default_view_mode: "table",
          default_order: "ASC",
          default_orderby: "date",
          allows_submission: "no",
          submission_anonymous_user: "no",
          submission_default_status: "draft",
          submission_use_recaptcha: "no",
          allow_comments: "closed",
          allow_item_slug_editing: "no",
          allow_item_author_editing: "no",
          hide_items_thumbnail_on_lists: "no",
          item_enabled_document_types: {
            attachment: {
              enabled: "yes",
              label: "Arquivo",
              icon: "attachments"
            },
            url: { enabled: "yes", label: "URL", icon: "url" },
            text: { enabled: "yes", label: "Texto simples", icon: "text" }
          },
          item_publication_label: "Data da publicação",
          item_document_label: "Documento",
          item_thumbnail_label: "Miniatura",
          item_enable_thumbnail: "yes",
          item_attachment_label: "Anexos",
          item_enable_attachments: "yes",
          item_enable_metadata_focus_mode: "yes",
          item_enable_metadata_required_filter: "yes",
          item_enable_metadata_searchbar: "yes",
          item_enable_metadata_collapses: "yes",
          item_enable_metadata_enumeration: "no"
        })
      })
    ])

    const failedRes = [res1, res2, res3].find((r) => !r.ok)
    if (failedRes) {
      const errorData = await failedRes.json().catch(() => ({
        message: "Erro de autorização no servidor de homologação."
      }))
      throw new Error(
        `Falha na criação no Tainacan: ${JSON.stringify(errorData)}`
      )
    }

    const [
      { id: museologicoId },
      { id: bibliograficoId },
      { id: arquivisticoId }
    ] = await Promise.all([res1.json(), res2.json(), res3.json()])

    const mappings: Record<string, Record<string, string>> = {
      museologico: {},
      bibliografico: {},
      arquivistico: {}
    }

    const [metadataRes1, metadataRes2, metadataRes3] = await Promise.all([
      fetch(
        `${config.url}/wp-json/tainacan/v2/collection/${museologicoId}/metadata/?nopaging=1&context=edit&include_disabled=true`,
        { method: "GET", headers: { Authorization: `Basic ${credentials}` } }
      ),
      fetch(
        `${config.url}/wp-json/tainacan/v2/collection/${bibliograficoId}/metadata/?nopaging=1&context=edit&include_disabled=true`,
        { method: "GET", headers: { Authorization: `Basic ${credentials}` } }
      ),
      fetch(
        `${config.url}/wp-json/tainacan/v2/collection/${arquivisticoId}/metadata/?nopaging=1&context=edit&include_disabled=true`,
        { method: "GET", headers: { Authorization: `Basic ${credentials}` } }
      )
    ])

    const [museologicoMetadata, bibliograficoMetadata, arquivisticoMetadata] =
      await Promise.all([
        metadataRes1.json(),
        metadataRes2.json(),
        metadataRes3.json()
      ])

    for (const field of museologicoMetadata) {
      if (field.metadata_type === "Tainacan\\Metadata_Types\\Core_Title") {
        mappings.museologico["titulo"] = String(field.id)
      } else if (
        field.metadata_type === "Tainacan\\Metadata_Types\\Core_Description"
      ) {
        mappings.museologico["resumodescritivo"] = String(field.id)
      }
    }

    for (const field of bibliograficoMetadata) {
      if (field.metadata_type === "Tainacan\\Metadata_Types\\Core_Title") {
        mappings.bibliografico["titulo"] = String(field.id)
      } else if (
        field.metadata_type === "Tainacan\\Metadata_Types\\Core_Description"
      ) {
        mappings.bibliografico["resumodescritivo"] = String(field.id)
      }
    }

    for (const field of arquivisticoMetadata) {
      if (field.metadata_type === "Tainacan\\Metadata_Types\\Core_Title") {
        mappings.arquivistico["titulo"] = String(field.id)
      } else if (
        field.metadata_type === "Tainacan\\Metadata_Types\\Core_Description"
      ) {
        mappings.arquivistico["resumodescritivo"] = String(field.id)
      }
    }

    for (const { field, collectionId, collection } of [
      ...museologicoFields
        .filter((f) => f.id !== "titulo" && f.id !== "resumodescritivo")
        .map((field) => ({
          field,
          collectionId: museologicoId,
          collection: "museologico"
        }))
        .reverse(),
      ...bibliograficoFields
        .filter((f) => f.id !== "titulo" && f.id !== "resumodescritivo")
        .map((field) => ({
          field,
          collectionId: bibliograficoId,
          collection: "bibliografico"
        }))
        .reverse(),
      ...arquivisticoFields
        .filter((f) => f.id !== "titulo" && f.id !== "resumodescritivo")
        .map((field) => ({
          field,
          collectionId: arquivisticoId,
          collection: "arquivistico"
        }))
        .reverse()
    ]) {
      const res = await fetch(
        `${config.url}/wp-json/tainacan/v2/collection/${collectionId}/metadata/?context=edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`
          },
          body: JSON.stringify({
            name: field.name,
            metadata_type: field.type.className,
            status: "publish",
            parent: "0"
          })
        }
      )

      const { id } = await res.json()
      mappings[collection][field.id] = String(id)
    }

    await ExportacaoModel.updateOne(
      { _id: exportacaoId },
      {
        $set: {
          mapeamento: mappings,
          colecoesCriadas: true,
          colecoes: {
            museologico: String(museologicoId),
            bibliografico: String(bibliograficoId),
            arquivistico: String(arquivisticoId)
          }
        }
      },
      { upsert: true }
    )
  }

  private escapeCsvValue(value: any): string {
    if (value === null || value === undefined) return ""
    const stringValue = String(value)
      .replace(/\r\n/g, " ")
      .replace(/\r/g, " ")
      .replace(/\n/g, " ")
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  gerarCsv(itens: any[], tipo: string): string {
    const fields = {
      museologico: museologicoFields,
      arquivistico: arquivisticoFields,
      bibliografico: bibliograficoFields
    }[tipo]

    if (!fields) {
      throw new Error(`Tipo de exportação inválido: ${tipo}`)
    }

    const header = fields.map((field) => `"${field.id}"`).join(",")

    const rows = itens.map((item) =>
      fields
        .map((field) => {
          let valor = item[field.id] || ""
          if (typeof valor === "string") {
            valor = valor.replace(/,/g, ".")
          }
          return this.escapeCsvValue(valor)
        })
        .join(",")
    )

    return [header, ...rows].join("\n")
  }

  async exportar(id: string): Promise<void> {
    const exportacao = await ExportacaoModel.findById(id)

    if (!exportacao) {
      throw new Error("Exportação não encontrada")
    }

    exportacao.status = "em_andamento"
    exportacao.iniciadoEm = new Date()
    await exportacao.save()

    setImmediate(() => {
      this.executarExportacaoBackground(id).catch(async (error) => {
        console.error(`Falha na exportação em background [${id}]:`, error)
        const exp = await ExportacaoModel.findById(id)
        if (exp) {
          exp.status = "erro"
          exp.erro = error instanceof Error ? error.message : "Erro fatal"
          exp.finalizadoEm = new Date()
          await exp.save()
        }
      })
    })
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Aguarda o job do Tainacan terminar e loga cada detalhe do progresso.
  // Retorna o JSON final da sessão (ou null se a sessão foi apagada pelo Tainacan,
  // o que indica sucesso).
  // ─────────────────────────────────────────────────────────────────────────────
  private async aguardarJobTainacan(
    baseUrl: string,
    credentials: string,
    sessionId: string,
    label: string
  ): Promise<any | null> {
    const MAX_TENTATIVAS = 120 // 10 minutos (120 × 5s)
    const INTERVALO_MS = 5000

    console.log(
      `\n[POLLING:${label}] Iniciando polling da sessão ${sessionId}...`
    )

    for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
      await new Promise((resolve) => setTimeout(resolve, INTERVALO_MS))

      let pollRes: Response
      try {
        pollRes = await fetch(
          `${baseUrl}/wp-json/tainacan/v2/importers/session/${sessionId}`,
          { method: "GET", headers: { Authorization: `Basic ${credentials}` } }
        )
      } catch (err) {
        console.warn(
          `[POLLING:${label}] Tentativa ${tentativa}: erro de rede — ${err}. Tentando novamente...`
        )
        continue
      }

      // ── Tainacan apaga a sessão quando conclui com sucesso ──
      if (pollRes.status === 400) {
        const body = await pollRes.json().catch(() => ({}))
        if (
          (body as any).error_message === "Sessão de Importador não encontrada"
        ) {
          console.log(
            `[POLLING:${label}] ✅ Sessão removida pelo Tainacan (job concluído com sucesso). Tentativa ${tentativa}.`
          )
          return null // sucesso — sessão apagada
        }
        console.error(
          `[POLLING:${label}] ❌ HTTP 400 inesperado:`,
          JSON.stringify(body)
        )
        return body
      }

      if (!pollRes.ok) {
        console.error(
          `[POLLING:${label}] ❌ HTTP ${pollRes.status} inesperado na tentativa ${tentativa}.`
        )
        return null
      }

      const poll = await pollRes.json()

      // ── Log de progresso ──
      console.log(
        `[POLLING:${label}] Tentativa ${tentativa}/${MAX_TENTATIVAS} | ` +
          `status=${poll.status ?? "?"} | ` +
          `progress=${poll.progress ?? "?"}% | ` +
          `processed=${poll.processed_item_count ?? "?"} | ` +
          `inserted=${poll.inserted_item_count ?? "?"} | ` +
          `updated=${poll.updated_item_count ?? "?"} | ` +
          `errors=${poll.error_log?.length ?? 0}`
      )

      // ── Log de erros item a item ──
      if (Array.isArray(poll.error_log) && poll.error_log.length > 0) {
        console.error(
          `[POLLING:${label}] ⚠️  ${poll.error_log.length} erro(s) reportado(s) pelo Tainacan:`
        )
        poll.error_log.forEach((err: any, idx: number) => {
          console.error(`  [erro ${idx + 1}]`, JSON.stringify(err))
        })
      }

      // ── Verificação de conclusão ──
      if (
        poll.status === "finished" ||
        poll.status === "done" ||
        Number(poll.progress) === 100
      ) {
        console.log(
          `[POLLING:${label}] ✅ Job CONCLUÍDO. ` +
            `inserted=${poll.inserted_item_count ?? "?"} | ` +
            `updated=${poll.updated_item_count ?? "?"} | ` +
            `errors=${poll.error_log?.length ?? 0}`
        )
        return poll
      }

      if (["failed", "error", "cancelled"].includes(poll.status)) {
        console.error(
          `[POLLING:${label}] ❌ Job FALHOU com status="${poll.status}".`
        )
        console.error(
          `[POLLING:${label}] Resposta completa:`,
          JSON.stringify(poll, null, 2)
        )
        return poll
      }
    }

    console.warn(
      `[POLLING:${label}] ⏱️  Timeout: job não concluiu em ${MAX_TENTATIVAS} tentativas.`
    )
    return null
  }

  private async executarExportacaoBackground(id: string): Promise<void> {
    const exportacao = await ExportacaoModel.findById(id)
    if (!exportacao) return

    try {
      const exportacaoEmAndamento = await ExportacaoModel.findOne({
        ano: exportacao.ano,
        status: "em_andamento",
        _id: { $ne: exportacao._id }
      })

      if (exportacaoEmAndamento) {
        throw new Error(
          `Já existe uma exportação em andamento para este ano (ID: ${exportacaoEmAndamento._id}). Aguarde a conclusão antes de iniciar outra.`
        )
      }

      const declaracoes = await Declaracoes.find({
        anoDeclaracao: exportacao.ano,
        status: "Em conformidade"
      }).select(
        "_id arquivistico.versao museologico.versao bibliografico.versao"
      )

      console.log(
        `[Exportação ${id}] Declarações em conformidade encontradas: ${declaracoes.length}`
      )

      const itens = await this.obterItensPorTipo(declaracoes)

      console.log(
        `[Exportação ${id}] Tipos encontrados: ${itens.map((i) => `${i._id}(${i.items.length})`).join(", ")}`
      )

      const config = await ConfiguracaoPortalPublicoModel.findOne({
        key: "portalPublico"
      })

      if (!config) {
        throw new Error("Configuração do portal público não encontrada")
      }

      const credentials = Buffer.from(
        `${config.node_de_usuario}:${config.senha}`
      ).toString("base64")

      const exportacaoPlain = exportacao.toObject()
      const mappings: Record<
        string,
        Record<string, string>
      > = exportacaoPlain.mapeamento || {}
      const sessoes: Record<
        string,
        { id: string; status: "em_andamento" | "concluida" | "erro" }
      > = {}

      let totalExportados = 0

      for (const { _id: tipo, items } of itens) {
        const tipoLower: string = (tipo || "").toLowerCase()
        const tamanhoLote = 500

        for (let i = 0; i < items.length; i += tamanhoLote) {
          const lote = items.slice(i, i + tamanhoLote)
          const label = `${tipoLower}_${i}`

          console.log(`\n${"=".repeat(60)}`)
          console.log(`[LOTE] ${label} — ${lote.length} itens`)
          console.log(`${"=".repeat(60)}`)

          // ── 1. Criar sessão ──
          const sessaoRes = await fetch(
            `${config.url}/wp-json/tainacan/v2/importers/session/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${credentials}`
              },
              body: JSON.stringify({ importer_slug: "csv" })
            }
          )
          const sessaoJson = await sessaoRes.json()
          const sessionId = sessaoJson.id
          console.log(`[${label}] Sessão criada: ${sessionId}`)

          sessoes[label] = { id: String(sessionId), status: "em_andamento" }

          // ── 2. Configurar opções ──
          const opcoesRes = await fetch(
            `${config.url}/wp-json/tainacan/v2/importers/session/${sessionId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${credentials}`
              },
              body: JSON.stringify({
                options: {
                  delimiter: ",",
                  multivalued_delimiter: "||",
                  encode: "utf8",
                  enclosure: '"',
                  escape_empty_value: "[empty value]",
                  repeated_item: "ignore",
                  server_path: ""
                }
              })
            }
          )
          console.log(
            `[${label}] Opções configuradas — HTTP ${opcoesRes.status}`
          )

          // ── 3. Upload do CSV ──
          const csvGerado = this.gerarCsv(lote, tipoLower)

          // Log das primeiras linhas do CSV para conferência
          const csvLinhas = csvGerado.split("\n")
          console.log(
            `[${label}] CSV gerado — ${csvLinhas.length - 1} linhas de dados`
          )
          console.log(`[${label}] CSV header: ${csvLinhas[0]}`)
          console.log(`[${label}] CSV linha 1: ${csvLinhas[1] ?? "(vazia)"}`)
          console.log(`[${label}] CSV linha 2: ${csvLinhas[2] ?? "(vazia)"}`)

          const formData = new FormData()
          formData.append(
            "file",
            new Blob([csvGerado], { type: "text/csv" }),
            "import.csv"
          )

          const uploadHeaders = new Headers()
          uploadHeaders.set("Accept", "application/json")
          uploadHeaders.set("Authorization", `Basic ${credentials}`)

          const uploadRes = await fetch(
            `${config.url}/wp-json/tainacan/v2/importers/session/${sessionId}/file`,
            { method: "POST", headers: uploadHeaders, body: formData }
          )
          const uploadText = await uploadRes.text()
          console.log(`[${label}] Upload — HTTP ${uploadRes.status}`)
          console.log(`[${label}] Upload resposta: ${uploadText}`)

          if (!uploadRes.ok) {
            console.error(`[${label}] ❌ Upload rejeitado. Pulando lote.`)
            sessoes[label].status = "erro"
            continue
          }

          // ── 4. Configurar mapeamento ──
          const rawMapping = mappings[tipoLower] ?? {}
          const invertedMapping: Record<string, string> = {}
          for (const [csvField, metadataId] of Object.entries(rawMapping)) {
            invertedMapping[String(metadataId)] = csvField
          }

          console.log(
            `[${label}] rawMapping:`,
            JSON.stringify(rawMapping, null, 2)
          )
          console.log(
            `[${label}] invertedMapping:`,
            JSON.stringify(invertedMapping, null, 2)
          )
          console.log(
            `[${label}] collection_id: ${exportacaoPlain.colecoes![tipoLower as keyof typeof exportacaoPlain.colecoes]}`
          )

          const mappingRes = await fetch(
            `${config.url}/wp-json/tainacan/v2/importers/session/${sessionId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${credentials}`
              },
              body: JSON.stringify({
                collection: {
                  id: exportacaoPlain.colecoes![
                    tipoLower as keyof typeof exportacaoPlain.colecoes
                  ],
                  mapping: invertedMapping,
                  total_items: lote.length
                }
              })
            }
          )
          const mappingText = await mappingRes.text()
          console.log(`[${label}] Mapping — HTTP ${mappingRes.status}`)
          console.log(`[${label}] Mapping resposta: ${mappingText}`)

          // ── 5. Disparar job ──
          const runRes = await fetch(
            `${config.url}/wp-json/tainacan/v2/importers/session/${sessionId}/run`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${credentials}`
              }
            }
          )
          const runText = await runRes.text()
          console.log(`[${label}] Run — HTTP ${runRes.status}`)
          console.log(`[${label}] Run resposta: ${runText}`)

          // ── 6. Aguardar e logar o resultado completo ──
          const jobFinal = await this.aguardarJobTainacan(
            config.url,
            credentials,
            sessionId,
            label
          )

          // jobFinal === null significa que o Tainacan removeu a sessão (sucesso normal)
          if (jobFinal?.status === "finished" || jobFinal?.status === "done") {
            // Tainacan confirmou explicitamente que terminou
            sessoes[label].status = "concluida"
          } else if (
            ["failed", "error", "cancelled"].includes(jobFinal?.status)
          ) {
            sessoes[label].status = "erro"
          } else {
            // null (sessão removida = job ainda na fila) ou timeout = aguardar checkExportStatus
            sessoes[label].status = "em_andamento"
          }

          totalExportados += lote.length
        }
      }

      exportacao.sessoes = sessoes
      exportacao.numeroExportados = totalExportados

      const algumErro = Object.values(sessoes).some((s) => s.status === "erro")

      if (algumErro) {
        exportacao.status = "erro"
        exportacao.finalizadoEm = new Date()
      } else {
        // Sempre deixa em_andamento — o checkExportStatus vai concluir
        exportacao.status = "em_andamento"
      }

      await exportacao.save()
    } catch (error) {
      exportacao.status = "erro"
      exportacao.erro =
        error instanceof Error
          ? error.message
          : "Erro desconhecido durante o processamento"
      exportacao.finalizadoEm = new Date()
      await exportacao.save()
    }
  }

  async listarExportacoes(): Promise<any> {
    const exportacoes = await ExportacaoModel.find()
      .sort({ createdAt: -1 })
      .select(
        "status iniciadoEm finalizadoEm numeroExportados totalExportacoesConcluidas"
      )
    return exportacoes
  }

  async obterExportacao(id: string): Promise<any> {
    const exportacao = await ExportacaoModel.findById(id)
      .populate("usuario", "nome email")
      .lean()
    if (!exportacao) {
      throw new Error("Exportação não encontrada")
    }
    return {
      ...exportacao,
      usuario: exportacao.usuario
        ? {
            nome: (exportacao.usuario as unknown as { nome: string }).nome,
            email: (exportacao.usuario as unknown as { email: string }).email
          }
        : null
    }
  }

  async criarExportacao(usuario: ObjectId, ano: ObjectId): Promise<any> {
    const exportacao = new ExportacaoModel({
      usuario,
      status: "nao_iniciada",
      finalizadoEm: null,
      numeroExportados: 0,
      totalExportacoesConcluidas: 0,
      ano
    })

    await exportacao.save()

    return exportacao
  }

  async baixarArquivos(id: string): Promise<NodeJS.ReadableStream> {
    const exportacao = await ExportacaoModel.findById(id)

    if (!exportacao) {
      throw new Error("Export not found")
    }

    if (exportacao.status !== "concluida") {
      throw new Error("Export has not been completed yet")
    }

    const declaracoes = await Declaracoes.find({
      anoDeclaracao: exportacao.ano
    }).select("_id arquivistico.versao museologico.versao bibliografico.versao")
    const itens = await this.obterItensPorTipo(declaracoes)

    const archive = archiver("zip", {
      zlib: { level: 9 }
    })

    for (const { _id: tipo, items } of itens) {
      const tipoLower: string = (tipo || "").toLowerCase()
      const csvContent = this.gerarCsv(items, tipoLower)
      archive.append(csvContent, { name: `${tipoLower}.csv` })
    }

    archive.finalize()

    return archive
  }
}
