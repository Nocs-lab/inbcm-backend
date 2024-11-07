import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Usuario } from "../models"; // Certifique-se de importar o modelo de Usuário
import MuseuController from "../controllers/MuseuController";
import UsuarioController from "../controllers/UsuarioController";
import {Museu} from "../models/Museu"; // Importar o modelo de Museu

const app = express();
app.use(express.json());
app.post("/museus", MuseuController.criarMuseu);
app.get("/museus", MuseuController.listarMuseus);
app.get("/museus/usuario", MuseuController.userMuseus);

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  await Museu.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("POST /museus", () => {
  it("Deve criar um novo museu com sucesso", async () => {
    const res = await request(app).post("/museus").send({
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
    });

    expect(res.status).toBe(201);
    expect(res.body.mensagem).toBe("Museu criado com sucesso!");
    expect(res.body.museu).toBeTruthy();
    expect(res.body.museu.nome).toBe("Museu de Arte");

    const museu = await Museu.findOne({ nome: "Museu de Arte" });
    expect(museu).toBeTruthy();
  });

  it("Deve retornar erro ao tentar criar um museu sem todos os campos obrigatórios", async () => {
    const res = await request(app).post("/museus").send({
      nome: "Museu Incompleto",
      endereco: {
        cidade: "Rio de Janeiro",
        uf: "RJ"
      },
      codIbram: "00124",
      esferaAdministraiva: "Estadual"
    });

    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe(
      "Todos os campos obrigatórios devem ser preenchidos."
    );
  });

  it("Deve retornar erro de servidor ao ocorrer um erro inesperado", async () => {
    jest.spyOn(Museu.prototype, "save").mockRejectedValue(new Error("Erro de servidor"));

    const res = await request(app).post("/museus").send({
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
    });

    expect(res.status).toBe(500);
    expect(res.body.mensagem).toBe("Erro ao criar museu.");
  });
});


describe("GET /museus", () => {
  it("Deve listar todos os museus", async () => {
    // Criar museus de exemplo para testar a listagem
    await Museu.create([
      {
        nome: "Museu de História Natural",
        endereco: {
          cidade: "Rio de Janeiro",
          logradouro: "Rua dos Museus",
          numero: "123",
          uf: "RJ",
          municipio: "Rio de Janeiro",
          cep: "20000-000",
          bairro: "Centro"
        },
        codIbram: "00001",
        esferaAdministraiva: "Estadual",
        usuario: new mongoose.Types.ObjectId()
      },
      {
        nome: "Museu de Arte Contemporânea",
        endereco: {
          cidade: "São Paulo",
          logradouro: "Avenida das Artes",
          numero: "456",
          uf: "SP",
          municipio: "São Paulo",
          cep: "01000-000",
          bairro: "Jardins"
        },
        codIbram: "00002",
        esferaAdministraiva: "Federal",
        usuario: new mongoose.Types.ObjectId()
      }
    ]);

    // Fazer a requisição para listar museus
    const res = await request(app).get("/museus");

    // Verificar a resposta
    expect(res.status).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(2); // Verifica se há dois museus retornados
  });

  it("Deve retornar erro de servidor ao ocorrer um erro inesperado", async () => {
    jest.spyOn(Museu, "find").mockRejectedValue(new Error("Erro de servidor"));

    const res = await request(app).get("/museus");

    expect(res.status).toBe(500);
    expect(res.body.mensagem).toBe("Erro ao listar museus.");
  });
});
