import request from "supertest"
import path from "path"
import {
  app,
  setupTestEnvironment,
  teardownTestEnvironment,
  museuMock
} from "./DeclaracaoMockSetup"
import mongoose from "mongoose"

let declaracaoId: string

beforeAll(async () => {
  await setupTestEnvironment()
})

afterAll(async () => {
  await teardownTestEnvironment()
})

const filePathMuseologico2itens = path.join(
  __dirname,
  "./assets/museologico2itens.xlsx"
)
const filePathArquivistico4itens = path.join(
  __dirname,
  "./assets/arquivistico4itens.xlsx"
)
const filePathBibliografico3itens = path.join(
  __dirname,
  "./assets/bibliografico3itens.xlsx"
)

describe("POST /public/declaracoes/uploads/:museu/:anoDeclaracao", () => {
  it("Deve enviar um arquivo Excel museológico, arquivistico e bibliográfico e verificar se a resposta recebe status code 200 e contém os dados corretos do museu, ano da declaração e status", async () => {
    const response = await request(app)
      .post(`/public/declaracoes/uploads/${museuMock._id}/2024`)
      .set("Authorization", `Bearer mocked-token`)
      .attach("museologico", filePathMuseologico2itens)
      .attach("arquivistico", filePathArquivistico4itens)
      .attach("bibliografico", filePathBibliografico3itens)
      .expect(200)

    const museuId = museuMock._id as unknown as mongoose.Types.ObjectId

    expect(response.body).toHaveProperty("museu_id", museuId.toString())
    expect(response.body).toHaveProperty("anoDeclaracao", "2024")
    expect(response.body).toHaveProperty("status", "Recebida")
    expect(response.body.museologico.quantidadeItens).toBe(2)
    expect(response.body.arquivistico.quantidadeItens).toBe(4)
    expect(response.body.bibliografico.quantidadeItens).toBe(3)

    declaracaoId = response.body._id
  })

  it("Deve retornar erro 406 se tentar criar uma declaração com ano referência e museu já utilizados", async () => {
    const response = await request(app)
      .post(`/public/declaracoes/uploads/${museuMock._id}/2024`)
      .set("Authorization", `Bearer mocked-token`)
      .attach("museologico", filePathMuseologico2itens)
      .expect(406)
  })
})

describe("GET /public/declaracoes/:id", () => {
  it("Deve buscar uma declaração pelo seu id", async () => {
    const response = await request(app)
      .get(`/public/declaracoes/${declaracaoId}`)
      .set("Authorization", `Bearer mocked-token`)
      .expect(200)
  })
})

describe("GET /admin/dashboard/getStatusEnum", () => {
  it("Deve retornar o enum de status", async () => {
    const response = await request(app)
      .get("/admin/dashboard/getStatusEnum")
      .set("Authorization", `Bearer mocked-token`)
      .expect(200)
  })
})

describe("GET /public/declaracoes/:museu/:anoDeclaracao", () => {
  it("Deve retornar uma declaração com base no ano e museu especificados", async () => {
    const response = await request(app)
      .get(`/public/declaracoes/${museuMock._id}/2024`)
      .set("Authorization", `Bearer mocked-token`)
      .expect(200)

    expect(response.body).toHaveProperty("museu_id", (museuMock._id as unknown as mongoose.Types.ObjectId).toString())
    expect(response.body).toHaveProperty("anoDeclaracao", "2024")
    expect(response.body).toHaveProperty("status")
    expect(response.body).toHaveProperty("museologico")
    expect(response.body).toHaveProperty("arquivistico")
    expect(response.body).toHaveProperty("bibliografico")
  })

  it("Deve retornar 404 se a declaração não for encontrada para o ano e museu especificados", async () => {
    const response = await request(app)
      .get(`/public/declaracoes/${museuMock._id}/2025`)
      .set("Authorization", `Bearer mocked-token`)
      .expect(404)

    expect(response.body).toHaveProperty(
      "message",
      "Declaração não encontrada para o ano especificado."
    )
  })
})

describe("GET /public/declaracoes", () => {
  it("Deve retornar as declarações do usuário logado, agrupando pela mais recente de cada museu e ano", async () => {
    const response = await request(app)
      .get("/public/declaracoes")
      .set("Authorization", `Bearer mocked-token`)
      .expect(200)

    expect(Array.isArray(response.body)).toBe(true)

    response.body.forEach((declaracao: any) => {
      expect(declaracao).toHaveProperty("museu_id")
      expect(declaracao).toHaveProperty("anoDeclaracao")
      expect(declaracao).toHaveProperty("status")
      expect(declaracao).toHaveProperty("createdAt")

      expect(declaracao.museu_id).toHaveProperty("nome")
    })

    const anosMuseus = new Set()
    response.body.forEach((declaracao: any) => {
      const key = `${declaracao.museu_id._id}-${declaracao.anoDeclaracao}`
      expect(anosMuseus.has(key)).toBe(false) // Cada museu-ano deve ser único
      anosMuseus.add(key)
    })
  })


})


