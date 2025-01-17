import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import UsuarioController from "../controllers/UsuarioController";
import Usuario from "../models/Usuario";
import {Profile} from '../models/Profile';
import DeclaracaoController from "../controllers/DeclaracaoController"


const app = express();
app.use(express.json());

const declaracaoController = new DeclaracaoController()

app.post("/register", UsuarioController.registerUsuario);
app.get("/usuarios", UsuarioController.getUsuarios);
app.get("/usuarios/:id", UsuarioController.getUsuarioPorId);
app.put("/usuarios/:id", UsuarioController.atualizarUsuario);
app.delete("/usuarios/:id", UsuarioController.deletarUsuario);
app.get("/usuarios/profile/:profileId", UsuarioController.getUsersByProfile);
app.get("/admin/declaracoes/analistas", declaracaoController.listarAnalistas)

let mongoServer: MongoMemoryServer;


beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

beforeEach(async () => {
  // Limpar a coleção de usuários antes de cada teste
  await Usuario.deleteMany({});
  await Profile.deleteMany({});
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe("POST /register", () => {
  it("Deve criar um novo usuário", async () => {
    const res = await request(app).post("/register").send({
      nome: "John Doe",
      email: "john@example.com",
      senha: "password123",
      profile: new mongoose.Types.ObjectId()
    });

    expect(res.status).toBe(201);
    expect(res.body.mensagem).toBe("Usuário criado com sucesso.");

    const usuario = await Usuario.findOne({ email: "john@example.com" });
    expect(usuario).toBeTruthy();
    expect(usuario?.nome).toBe("John Doe");
  });

  it("Deve retornar erro se o email já estiver em uso", async () => {
    await new Usuario({
      nome: "Jane Doe",
      email: "jane@example.com",
      senha: "password123",
      profile: new mongoose.Types.ObjectId()
    }).save();

    const res = await request(app).post("/register").send({
      nome: "John Doe",
      email: "jane@example.com",
      senha: "password456",
      profile: new mongoose.Types.ObjectId()
    });

    expect(res.status).toBe(400);
    expect(res.body.mensagem).toBe("Email já está em uso.");
  });
});

describe("GET /usuarios", () => {
  it("Deve retornar uma lista de usuários ativos", async () => {
    // Salvar o perfil e esperar que seja concluído
    const profileTeste = await new Profile({
      name: "analyst",
      description: "Teste Profile",
      permissions: [],
      isProtected: false
    }).save();

    // Criar usuários utilizando o ID do profileTeste
    await new Usuario({
      nome: "Alice",
      email: "alice@example.com",
      senha: "password123",
      profile: profileTeste._id, // Vincular o ID do perfil
      ativo: true
    }).save();

    await new Usuario({
      nome: "Bob",
      email: "bob@example.com",
      senha: "password123",
      profile: profileTeste._id, // Vincular o ID do perfil
      ativo: true
    }).save();

    // Fazer a requisição para obter usuários
    const res = await request(app).get("/usuarios");

    // Verificações
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });
});


describe("GET /usuarios/:id", () => {
  it("Deve retornar um usuário por ID", async () => {
    const usuario = await new Usuario({
      nome: "Carlos",
      email: "carlos@example.com",
      senha: "password123",
      profile: new mongoose.Types.ObjectId()
    }).save();

    const res = await request(app).get(`/usuarios/${usuario._id}`);

    expect(res.status).toBe(200);
    expect(res.body.nome).toBe("Carlos");
  });

  it("Deve retornar erro se o usuário não for encontrado", async () => {
    const res = await request(app).get(`/usuarios/${new mongoose.Types.ObjectId()}`);

    expect(res.status).toBe(404);
    expect(res.body.mensagem).toBe("Usuário não encontrado.");
  });
});

describe("PUT /usuarios/:id", () => {
  it("Deve atualizar um usuário existente", async () => {
    const usuario = await new Usuario({
      nome: "Diana",
      email: "diana@example.com",
      senha: "password123",
      profile: new mongoose.Types.ObjectId()
    }).save();

    const res = await request(app).put(`/usuarios/${usuario._id}`).send({
      nome: "Diana Updated",
      email: "diana.updated@example.com"
    });

    expect(res.status).toBe(200);
    expect(res.body.mensagem).toBe("Usuário atualizado com sucesso.");

    const updatedUser = await Usuario.findById(usuario._id);
    expect(updatedUser?.nome).toBe("Diana Updated");
    expect(updatedUser?.email).toBe("diana.updated@example.com");
  });

  it("Deve retornar erro se o usuário não for encontrado", async () => {
    const res = await request(app).put(`/usuarios/${new mongoose.Types.ObjectId()}`).send({
      nome: "Não Encontrado"
    });

    expect(res.status).toBe(404);
    expect(res.body.mensagem).toBe("Usuário não encontrado.");
  });
});

describe("DELETE /usuarios/:id", () => {
  it("Deve deletar um usuário existente", async () => {
    const usuario = await new Usuario({
      nome: "Eve",
      email: "eve@example.com",
      senha: "password123",
      profile: new mongoose.Types.ObjectId()
    }).save();

    const res = await request(app).delete(`/usuarios/${usuario._id}`);

    expect(res.status).toBe(200);
    expect(res.body.mensagem).toBe("Usuário deletado com sucesso.");

    const deletedUser = await Usuario.findById(usuario._id);
    expect(deletedUser?.ativo).toBe(false);
  });

  it("Deve retornar erro se o usuário não for encontrado", async () => {
    const res = await request(app).delete(`/usuarios/${new mongoose.Types.ObjectId()}`);

    expect(res.status).toBe(404);
    expect(res.body.mensagem).toBe("Usuário não encontrado.");
  });
});

describe("GET /usuarios/profile/:profileId", () => {
  it("Deve retornar usuários vinculados a um perfil", async () => {
    // Criar um novo perfil
    const profileTeste = await new Profile({
      name: "Admin",
      description: "Perfil de administrador",
      permissions: [],
      isProtected: false
    }).save();

    // Criar usuários vinculados ao perfil criado
    await new Usuario({
      nome: "John",
      email: "john@example.com",
      senha: "password123",
      profile: profileTeste._id,
      ativo: true
    }).save();

    await new Usuario({
      nome: "Jane",
      email: "jane@example.com",
      senha: "password123",
      profile: profileTeste._id,
      ativo: true
    }).save();

    // Fazer a requisição para obter usuários pelo ID do perfil
    const res = await request(app).get(`/usuarios/profile/${profileTeste._id}`);

    // Verificar se a resposta está correta
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].nome).toBe("John");
    expect(res.body[1].nome).toBe("Jane");
  });

  it("Deve retornar erro se não houver usuários para o perfil", async () => {
    // Criar um perfil sem usuários associados
    const profileVazio = await new Profile({
      name: "Empty Profile",
      description: "Sem usuários",
      permissions: [],
      isProtected: false
    }).save();

    // Fazer a requisição para o perfil sem usuários
    const res = await request(app).get(`/usuarios/profile/${profileVazio._id}`);

    // Verificar se retorna status 404 com a mensagem correta
    expect(res.status).toBe(404);
    expect(res.body.mensagem).toBe("Nenhum usuário encontrado para este perfil.");
  });
});

