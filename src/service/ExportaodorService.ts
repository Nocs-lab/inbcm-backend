import { Declaracoes } from "../models"
import ConfiguracaoPortalPublicoModel from "../models/Configuracao/portalPublico"
import ExportacaoModel from "../models/Exportacao"
import { ObjectId } from "mongoose"
import BemCultural from "../models/BemCultural"

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
  async criarColecoes(exportacaoId: string): Promise<void> {
    const config = await ConfiguracaoPortalPublicoModel.findOne({
      key: "portalPublico"
    })

    if (!config) {
      throw new Error("Configuração do portal público não encontrada")
    }

    const credentials = Buffer.from(`${config.node_de_usuario}:${config.senha}`).toString(
      "base64"
    )

    const [res1, res2, res3] = await Promise.all([
      fetch(
        `${config.url}/wp-json/tainacan/v2/collections/?context=edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`
          },
          body: JSON.stringify({
            name: "Museológico",
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
        }
      ),
      fetch(
        `${config.url}/wp-json/tainacan/v2/collections/?context=edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`
          },
          body: JSON.stringify({
            name: "Bibliográfico",
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
        }
      ),
      fetch(
        `${config.url}/wp-json/tainacan/v2/collections/?context=edit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`
          },
          body: JSON.stringify({
            name: "Arquivistico",
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
        }
      )
    ])

    const [
      { id: museologicoId },
      { id: arquivisticoId },
      { id: bibliograficoId }
    ] = await Promise.all([res1.json(), res2.json(), res3.json()])

    const mappings: Record<string, Record<string, string>> = {
      museologico: {},
      bibliografico: {},
      arquivistico: {}
    }

        const [metadataRes1, metadataRes2, metadataRes3] = await Promise.all([
      fetch(
        `${config.url}/wp-json/tainacan/v2/collection/${museologicoId}/metadata/?nopaging=1&context=edit&include_disabled=true`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${credentials}`
          }
        }
      ),
      fetch(
        `${config.url}/wp-json/tainacan/v2/collection/${bibliograficoId}/metadata/?nopaging=1&context=edit&include_disabled=true`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${credentials}`
          }
        }
      ),
      fetch(
        `${config.url}/wp-json/tainacan/v2/collection/${arquivisticoId}/metadata/?nopaging=1&context=edit&include_disabled=true`,
        {
          method: "GET",
          headers: {
            Authorization: `Basic ${credentials}`
          }
        }
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
        mappings.museologico[field.id] = "titulo"
      }
      else if (field.metadata_type === "Tainacan\\Metadata_Types\\Core_Description") {
        mappings.museologico[field.id] = "resumodescritivo"
      }
    }

    for (const field of bibliograficoMetadata) {
      if (field.metadata_type === "Tainacan\\Metadata_Types\\Core_Title") {
        mappings.bibliografico[field.id] = "titulo"
      }
      else if (field.metadata_type === "Tainacan\\Metadata_Types\\Core_Description") {
        mappings.bibliografico[field.id] = "resumodescritivo"
      }
    }

    for (const field of arquivisticoMetadata) {
      if (field.metadata_type === "Tainacan\\Metadata_Types\\Core_Title") {
        mappings.arquivistico[field.id] = "titulo"
      }
      else if (field.metadata_type === "Tainacan\\Metadata_Types\\Core_Description") {
        mappings.arquivistico[field.id] = "resumodescritivo"
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

      mappings[collection][String(id)] = field.id
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

  gerarCsv(itens: any[], tipo: string): string {
    const fields = {
      museologico: museologicoFields,
      arquivistico: arquivisticoFields,
      bibliografico: bibliograficoFields
    }[tipo]

    if (!fields) {
      throw new Error(`Tipo de exportação inválido: ${tipo}`)
    }

    const csvContent = [
      fields!.map((field) => field.id).join(";"),
      ...itens.map((item) =>
        fields!.map((field) => item[field.id] || "").join(";")
      )
    ].join("\n")

    return csvContent
  }

  async exportar(id: string): Promise<void> {
    const exportacao = await ExportacaoModel.findById(id)

    if (!exportacao) {
      throw new Error("Exportação não encontrada")
    }
      
    const declaracoes = await Declaracoes.find({
      anoDeclaracao: exportacao.ano
    }).select("_id")
  
    const declaracaoIds = declaracoes.map((d) => d._id)

    const maxVersaoResult = await BemCultural.aggregate([
      {
        $match: {
          declaracao_ref: { $in: declaracaoIds }
        }
      },
      {
        $group: {
          _id: null,
          maxVersao: { $max: "$versao" }
        }
      }
    ])
  
    const maxVersao = maxVersaoResult[0]?.maxVersao

    const itens = await BemCultural.aggregate([
      {
        $match: {
          versao: maxVersao,
          declaracao_ref: { $in: declaracaoIds }
        }
      },
      {
        $group: {
          _id: "$__t",
          items: { $push: "$$ROOT" }
        }
      }
    ])

    const config = await ConfiguracaoPortalPublicoModel.findOne({
      key: "portalPublico"
    })

    if (!config) {
      throw new Error("Configuração do portal público não encontrada")
    }

    const credentials = Buffer.from(
      `${config.node_de_usuario}:${config.senha}`
    ).toString("base64")

    const mappings: Record<string, Record<string, string>> = exportacao.mapeamento || {}

    for (const { _id: tipo, items } of itens) {
      const tipoLower: string = (tipo || "").toLowerCase()
      
      const res = await fetch(
        `${process.env.PUBLIC_PORTAL_URL}/wp-json/tainacan/v2/importers/session/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`
          },
          body: JSON.stringify({
            importer_slug: "csv"
          })
        }
      )

      const { id: sessionId } = await res.json()

      await fetch(
        `${process.env.PUBLIC_PORTAL_URL}/wp-json/tainacan/v2/importers/session/${sessionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`
          },
          body: JSON.stringify({
            options: {
              delimiter: ";",
              multivalued_delimiter: "||",
              enclosure: "",
              encode: "utf8",
              escape_empty_value: "[empty value]",
              repeated_item: "update",
              server_path: ""
            }
          })
        }
      )

      const formData = new FormData()
      formData.append(
        "file",
        new Blob([this.gerarCsv(items, tipoLower)], {
          type: "text/csv"
        }),
        "import.csv"
      )

      const headers = new Headers()
      headers.set("Accept", "application/json")
      headers.set("Authorization", `Basic ${credentials}`)

      await fetch(
        `${process.env.PUBLIC_PORTAL_URL}/wp-json/tainacan/v2/importers/session/${sessionId}/file`,
        {
          method: "POST",
          headers,
          body: formData
        }
      )

      await fetch(
        `${process.env.PUBLIC_PORTAL_URL}/wp-json/tainacan/v2/importers/session/${sessionId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`
          },
          body: JSON.stringify({
            collection: {
              id: exportacao.colecoes![tipoLower as keyof typeof exportacao.colecoes],
              mapping: mappings[tipoLower],
              total_items: items.length
            }
          })
        }
      )

      await fetch(
        `${process.env.PUBLIC_PORTAL_URL}/wp-json/tainacan/v2/importers/session/${sessionId}/run`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${credentials}`
          }
        }
      )
    }

    exportacao.status = "em_andamento"
    exportacao.iniciadoEm = new Date()
    exportacao.numeroExportados = itens.length
    await exportacao.save()
  }

  async listarExportacoes(): Promise<any> {
    const exportacoes = await ExportacaoModel.find()
      .sort({ createdAt: -1 })
      .select("status iniciadoEm finalizadoEm numeroExportados totalExportacoesConcluidas")
 
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
    console.log("Criando exportação para usuário:", usuario, "e ano:", ano)
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
}
