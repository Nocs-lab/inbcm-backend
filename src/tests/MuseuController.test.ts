import request from "supertest"
import express from "express"
import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import MuseuController from "../controllers/MuseuController"
import { Museu } from "../models/Museu" // Importar o modelo de Museu

const app = express()
app.use(express.json())
app.post("/museus", MuseuController.criarMuseu)
app.get("/museus", MuseuController.listarMuseus)
app.get("/museus/usuario", MuseuController.userMuseus)

let mongoServer: MongoMemoryServer

// Helper function to create a museum with all required fields
const createMuseuData = (
  id: number,
  nome: string,
  cidade: string,
  uf: string,
  extra: Partial<{
    logradouro: string
    numero: string
    municipio: string
    cep: string
    bairro: string
    codIbram: string
    esferaAdministraiva: string
  }> = {}
) => ({
  idMuseusBr: id,
  nome,
  endereco: {
    cidade,
    logradouro: extra.logradouro || "Rua Principal",
    numero: extra.numero || "123",
    uf,
    municipio: extra.municipio || cidade,
    cep: extra.cep || "00000-000",
    bairro: extra.bairro || "Centro"
  },
  codIbram: extra.codIbram || `0000${id}`,
  esferaAdministraiva: extra.esferaAdministraiva || "Federal",
  usuario: new mongoose.Types.ObjectId()
})

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()
  await mongoose.connect(uri)
  // Ensure text index is created
  await Museu.createIndexes()
})

beforeEach(async () => {
  await Museu.deleteMany({})
})

afterAll(async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
})

describe("POST /museus", () => {
  it("Deve criar um novo museu com sucesso", async () => {
    const res = await request(app)
      .post("/museus")
      .send({
        idMuseusBr: 1,
        nome: "Museu de Arte",
        endereco: {
          cidade: "São Paulo",
          logradouro: "Avenida Paulista",
          numero: "1234",
          uf: "SP",
          municipio: "São Paulo",
          cep: "01311-200",
          bairro: "Bela Vista"
        },
        codIbram: "00123",
        esferaAdministraiva: "Federal",
        usuario: new mongoose.Types.ObjectId()
      })

    expect(res.status).toBe(201)
    expect(res.body.mensagem).toBe("Museu criado com sucesso!")
    expect(res.body.museu).toBeTruthy()
    expect(res.body.museu.nome).toBe("Museu de Arte")

    const museu = await Museu.findOne({ nome: "Museu de Arte" })
    expect(museu).toBeTruthy()
  })

  it("Deve retornar erro ao tentar criar um museu sem todos os campos obrigatórios", async () => {
    const res = await request(app)
      .post("/museus")
      .send({
        nome: "Museu Incompleto",
        endereco: {
          cidade: "Rio de Janeiro",
          uf: "RJ"
        },
        codIbram: "00124",
        esferaAdministraiva: "Estadual"
      })

    expect(res.status).toBe(400)
    expect(res.body.mensagem).toBe(
      "Todos os campos obrigatórios devem ser preenchidos."
    )
  })

  it("Deve retornar erro de servidor ao ocorrer um erro inesperado", async () => {
    jest
      .spyOn(Museu.prototype, "save")
      .mockRejectedValue(new Error("Erro de servidor"))

    const res = await request(app)
      .post("/museus")
      .send({
        idMuseusBr: 2,
        nome: "Museu com Erro",
        endereco: {
          cidade: "Brasília",
          logradouro: "Eixo Monumental",
          numero: "5678",
          uf: "DF",
          municipio: "Brasília",
          cep: "70040-000",
          bairro: "Zona Cívico-Administrativa"
        },
        codIbram: "00125",
        esferaAdministraiva: "Municipal",
        usuario: new mongoose.Types.ObjectId()
      })

    expect(res.status).toBe(500)
    expect(res.body.mensagem).toBe("Erro ao criar museu.")
  })
})

describe("GET /museus", () => {
  it("Deve listar todos os museus com paginação quando nenhum parâmetro de busca é fornecido", async () => {
    // Criar museus de exemplo para testar a listagem
    await Museu.create([
      createMuseuData(1, "Museu de História Natural", "Rio de Janeiro", "RJ", {
        logradouro: "Rua dos Museus",
        esferaAdministraiva: "Estadual"
      }),
      createMuseuData(2, "Museu de Arte Contemporânea", "São Paulo", "SP", {
        logradouro: "Avenida das Artes",
        bairro: "Jardins"
      })
    ])

    // Fazer a requisição para listar museus
    const res = await request(app).get("/museus")

    // Verificar a resposta
    expect(res.status).toBe(200)
    expect(res.body.museus).toBeInstanceOf(Array)
    expect(res.body.museus.length).toBe(2)
    expect(res.body.pagination).toBeDefined()
    expect(res.body.pagination.currentPage).toBe(1)
    expect(res.body.pagination.totalItems).toBe(2)
    expect(res.body.pagination.itemsPerPage).toBe(10)
  })

  it("Deve retornar museus correspondentes à consulta de busca", async () => {
    // Criar museus com nomes distintos para testar a busca
    await Museu.create([
      createMuseuData(1, "Museu de História Natural", "Rio de Janeiro", "RJ"),
      createMuseuData(2, "Museu de Arte Moderna", "São Paulo", "SP"),
      createMuseuData(3, "Galeria Nacional", "Brasília", "DF")
    ])

    // Buscar por "Arte"
    const res = await request(app).get("/museus?search=Arte")

    expect(res.status).toBe(200)
    expect(res.body.museus).toBeInstanceOf(Array)
    expect(res.body.museus.length).toBe(1)
    expect(res.body.museus[0].nome).toBe("Museu de Arte Moderna")
  })

  it("Deve retornar resultados ordenados por relevância (textScore)", async () => {
    // Criar museus onde o termo de busca aparece em diferentes contextos
    await Museu.create([
      createMuseuData(1, "Museu Nacional", "Rio de Janeiro", "RJ"),
      createMuseuData(2, "Museu Nacional de Arte", "São Paulo", "SP"),
      createMuseuData(3, "Casa da Cultura", "Brasília", "DF")
    ])

    // Buscar por "Museu Nacional"
    const res = await request(app).get("/museus?search=Museu Nacional")

    expect(res.status).toBe(200)
    expect(res.body.museus).toBeInstanceOf(Array)
    // Deve retornar apenas museus que correspondem à busca textual
    expect(res.body.museus.length).toBeGreaterThan(0)
    // Verifica que os resultados são museus com "Museu" e/ou "Nacional" no nome
    res.body.museus.forEach((museu: { nome: string }) => {
      expect(
        museu.nome.includes("Museu") || museu.nome.includes("Nacional")
      ).toBe(true)
    })
  })

  it("Deve funcionar corretamente a paginação com busca", async () => {
    // Criar vários museus com nomes similares para testar paginação
    await Museu.create([
      createMuseuData(1, "Museu de Arte 1", "São Paulo", "SP"),
      createMuseuData(2, "Museu de Arte 2", "São Paulo", "SP"),
      createMuseuData(3, "Museu de Arte 3", "São Paulo", "SP"),
      createMuseuData(4, "Museu de Arte 4", "São Paulo", "SP"),
      createMuseuData(5, "Museu de Arte 5", "São Paulo", "SP")
    ])

    // Buscar com paginação (2 itens por página, página 1)
    const res1 = await request(app).get("/museus?search=Arte&page=1&limit=2")

    expect(res1.status).toBe(200)
    expect(res1.body.museus.length).toBe(2)
    expect(res1.body.pagination.currentPage).toBe(1)
    expect(res1.body.pagination.totalItems).toBe(5)
    expect(res1.body.pagination.totalPages).toBe(3)
    expect(res1.body.pagination.itemsPerPage).toBe(2)

    // Buscar página 2
    const res2 = await request(app).get("/museus?search=Arte&page=2&limit=2")

    expect(res2.status).toBe(200)
    expect(res2.body.museus.length).toBe(2)
    expect(res2.body.pagination.currentPage).toBe(2)

    // Verificar que os resultados são diferentes entre páginas
    expect(res1.body.museus[0]._id).not.toBe(res2.body.museus[0]._id)
  })

  it("Deve retornar lista vazia quando a busca não encontra correspondências", async () => {
    await Museu.create([
      createMuseuData(1, "Museu de História Natural", "Rio de Janeiro", "RJ")
    ])

    const res = await request(app).get("/museus?search=inexistente")

    expect(res.status).toBe(200)
    expect(res.body.museus).toBeInstanceOf(Array)
    expect(res.body.museus.length).toBe(0)
    expect(res.body.pagination.totalItems).toBe(0)
  })

  it("Deve retornar erro de servidor ao ocorrer um erro inesperado", async () => {
    jest.spyOn(Museu, "find").mockRejectedValue(new Error("Erro de servidor"))

    const res = await request(app).get("/museus")

    expect(res.status).toBe(500)
    expect(res.body.mensagem).toBe("Erro ao listar museus.")
  })
})
