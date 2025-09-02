// import { Museologico } from "./src/models/Museologico"
// import { Bibliografico } from "./src/models/Bibliografico"
// import { Arquivistico } from "./src/models/Arquivistico"
import mongoose from "mongoose"
import config from "./src/config"
import fs from "fs/promises"

mongoose.set("strictQuery", true)
await mongoose.connect(config.DB_URL!)

const USERNAME = process.env.WP_USER
const APPLICATION_PASSWORD = process.env.TAINACAN_TOKEN

const credentials = Buffer.from(`${USERNAME}:${APPLICATION_PASSWORD}`).toString(
  "base64"
)

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

async function createCollections() {
  /*
  const itensMusologico = (await Museologico.find().lean()).map((item) => {
    delete item._id
    // @ts-expect-error Dont need where
    delete item.versao
    // @ts-expect-error Dont need where
    delete item.declaracao_ref

    return item
  })

  const itensBibliografico = (await Bibliografico.find().lean()).map((item) => {
    delete item._id
    // @ts-expect-error Dont need where
    delete item.versao
    // @ts-expect-error Dont need where
    delete item.declaracao_ref

    return item
  })

  const itensArquivistico = (await Arquivistico.find().lean()).map((item) => {
    delete item._id
    // @ts-expect-error Dont need where
    delete item.versao
    // @ts-expect-error Dont need where
    delete item.declaracao_ref

    return item
  })
    */

  const [res1, res2, res3] = await Promise.all([
    fetch(
      `${process.env.PUBLIC_PORTAL_URL}/wp-json/tainacan/v2/collections/?context=edit`,
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
      `${process.env.PUBLIC_PORTAL_URL}/wp-json/tainacan/v2/collections/?context=edit`,
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
      `${process.env.PUBLIC_PORTAL_URL}/wp-json/tainacan/v2/collections/?context=edit`,
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

  for (const { field, collectionId, collection } of [
    ...museologicoFields
      .map((field) => ({
        field,
        collectionId: museologicoId,
        collection: "museologico"
      }))
      .reverse(),
    ...bibliograficoFields
      .map((field) => ({
        field,
        collectionId: bibliograficoId,
        collection: "bibliografico"
      }))
      .reverse(),
    ...arquivisticoFields
      .map((field) => ({
        field,
        collectionId: arquivisticoId,
        collection: "arquivistico"
      }))
      .reverse()
  ]) {
    const res = await fetch(
      `${process.env.PUBLIC_PORTAL_URL}/wp-json/tainacan/v2/collection/${collectionId}/metadata/?context=edit`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`
        },
        body: JSON.stringify({
          name: field.type.name,
          metadata_type: field.type.className,
          status: "auto-draft",
          parent: "0"
        })
      }
    )

    const { id } = await res.json()

    await fetch(
      `${process.env.PUBLIC_PORTAL_URL}/wp-json/tainacan/v2/metadata/${id}?context=edit&include_options_as_html=yes`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${credentials}`
        },
        body: JSON.stringify({
          id,
          status: "publish",
          name: field.name,
          slug: field.type.name.toLowerCase().replace(/\s+/g, "-"),
          order: 0,
          parent: 0,
          description: "",
          description_bellow_name: "no",
          placeholder: "",
          metadata_type: field.type.className,
          metadata_type_object: field.type,
          required: "no",
          collection_key: "no",
          multiple: "no",
          cardinality: "",
          default_value: "",
          metadata_type_options: [],
          collection_id: String(collectionId),
          accept_suggestion: false,
          exposer_mapping: [],
          display: "no",
          semantic_uri: "",
          repository_level: null,
          metadata_section_id: "default_section"
        })
      }
    )

    mappings[collection][String(id)] = field.id
  }

  console.log("\n\nColeções criadas com sucesso!\n\n")

  for (const { type, collectionId } of [
    { type: "museologico", collectionId: museologicoId },
    { type: "bibliografico", collectionId: bibliograficoId },
    { type: "arquivistico", collectionId: arquivisticoId }
  ]) {
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
      new Blob([new Uint8Array(await fs.readFile(`${type}.csv`))], {
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
            id: collectionId,
            mapping: mappings[type],
            total_items: 10
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
}

await createCollections()
