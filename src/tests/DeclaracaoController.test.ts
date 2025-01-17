import request from "supertest"
import path from "path"
import {
  app,
  setupTestEnvironment,
  teardownTestEnvironment,
  museuMock
} from "./DeclaracaoMockSetup"
import mongoose from "mongoose"
import { Usuario } from "../models/Usuario"
import { Profile } from "../models/Profile"

let declaracaoId: string
let usuarioId: mongoose.Types.ObjectId
let muu: any

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
    muu = museuMock._id as unknown as mongoose.Types.ObjectId

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

    expect(response.body).toHaveProperty(
      "museu_id",
      (museuMock._id as unknown as mongoose.Types.ObjectId).toString()
    )
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

describe("PUT /api/admin/declaracoes/atualizarStatus/:id", () => {
  it("Deve atualizar o status da declaração com sucesso", async () => {
    const response = await request(app)
      .put(`/api/admin/declaracoes/atualizarStatus/${declaracaoId}`)
      .set("Authorization", `Bearer mocked-token`)
      .send({ status: "Recebida" })
      .expect(200)

    expect(response.body).toHaveProperty("status", "Recebida")
    expect(response.body.museologico.status).toBe("Recebida")
    expect(response.body.arquivistico.status).toBe("Recebida")
    expect(response.body.bibliografico.status).toBe("Recebida")
  })
})

describe("GET /admin/declaracoes/analistas", () => {
  it("Deve retornar uma lista de analistas com status 200", async () => {
    // Mockando o perfil "analyst"
    const profileTeste = await new Profile({
      name: "analyst",
      description: "analyst",
      permissions: [],
      isProtected: false
    }).save()

    // Criando usuários "Alice" e "Bob" utilizando o ID do profileTeste
    const alice = await new Usuario({
      nome: "Alice",
      email: "alice@example.com",
      senha: "password123",
      profile: profileTeste._id, // Vincular o ID do perfil de analista
      ativo: true
    }).save()

    usuarioId = alice._id as mongoose.Types.ObjectId

    await new Usuario({
      nome: "Bob",
      email: "bob@example.com",
      senha: "password123",
      profile: profileTeste._id, // Vincular o ID do perfil de analista
      ativo: true
    }).save()

    // Fazer a requisição para a rota de listar analistas
    const response = await request(app)
      .get("/admin/declaracoes/analistas")
      .set("Authorization", `Bearer mocked-token`)
      .expect(200)
  })
})

describe("PUT /admin/declaracoes/:id/analises", () => {
  it("Deve atualizar o status da declaração para 'Em Análise' e associar o(s) analista(s)", async () => {
    const response = await request(app)
      .put(`/admin/declaracoes/${declaracaoId}/analises`)
      .set("Authorization", `Bearer mocked-token`)
      .send({
        analistas: [usuarioId] // Enviando `usuarioId` como array de strings
      })
      .expect(200)

    expect(response.body).toHaveProperty("status", "Em análise")
    expect(response.body).toHaveProperty("_id", declaracaoId)
  })
})

describe("PUT /admin/declaracoes/:id/analises-concluir", () => {
  it("Deve concluir a análise da declaração e atualizar o status para 'Não conformidade'", async () => {
    // Supondo que você já tenha uma declaração criada, vamos pegar o ID dela

    const response = await request(app)
      .put(`/admin/declaracoes/${declaracaoId}/analises-concluir`)
      .set("Authorization", `Bearer mocked-token`)
      .send({
        status: "Não conformidade" // Enviando o status como 'Não conformidade'
      })
      .expect(200)

    // Verificando se a resposta contém o status atualizado
    expect(response.body).toHaveProperty("status", "Não conformidade")
    expect(response.body).toHaveProperty("_id", declaracaoId)
    expect(response.body).toHaveProperty("dataFimAnalise")
  })

  it("Deve retornar erro 500 se a declaração não for encontrada", async () => {
    // Usando um ID de declaração inválido
    const invalidDeclaracaoId = "id-invalido"

    const response = await request(app)
      .put(`/admin/declaracoes/${invalidDeclaracaoId}/analises-concluir`)
      .set("Authorization", `Bearer mocked-token`)
      .send({
        status: "Não conformidade"
      })
      .expect(500)

    expect(response.body).toHaveProperty(
      "message",
      "Erro ao concluir análise da declaração."
    )
  })

  it("Deve retornar erro 500 para status inválido", async () => {
    const declaracaoId = "id-da-declaracao" // Substitua com o ID real ou mockado de uma declaração

    const response = await request(app)
      .put(`/admin/declaracoes/${declaracaoId}/analises-concluir`)
      .set("Authorization", `Bearer mocked-token`)
      .send({
        status: "Status inválido" // Status que não é válido
      })
      .expect(500)

    expect(response.body).toHaveProperty(
      "message",
      "Erro ao concluir análise da declaração."
    )
  })
})

describe("GET /admin/declaracoes/analistas-filtrados", () => {
  it("Deve retornar status 200 ao buscar declarações agrupadas por analista", async () => {
    const response = await request(app)
      .get("/admin/declaracoes/analistas-filtrados") // Substitua pela rota correta
      .set("Authorization", `Bearer mocked-token`)
      .expect(200)

    expect(Array.isArray(response.body)).toBe(true)
  })
})
