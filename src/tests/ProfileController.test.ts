import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import ProfileController from "../controllers/ProfileController"; // Certifique-se de importar o controlador
import { Profile } from "../models/Profile";
import { Permission } from "../models/Permission";
import { Usuario } from "../models/Usuario";
import argon2 from "@node-rs/argon2"

const app = express();
app.use(express.json()); // Middleware para parsing de JSON

// Definindo as rotas manualmente para o ProfileController
app.post("/admin/profile", ProfileController.createProfile);
app.get("/admin/profile", ProfileController.getProfiles);
app.get("/admin/profile/:id", ProfileController.getProfileById);
app.put("/admin/profile/:id", ProfileController.updateProfile);
app.delete("/admin/profile/:id", ProfileController.deleteProfile);
app.post("/admin/profile/permissions", ProfileController.addPermissions);

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

afterEach(async () => {
  await Profile.deleteMany();
  await Permission.deleteMany();
  await Usuario.deleteMany();
});



describe("ProfileController", () => {

  it("Deve criar um perfil", async () => {
    const res = await request(app)
      .post("/admin/profile")
      .send({
        name: "manager",
        description: "Manager profile",
        permissions: [],
      });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("manager");
  });

  it("Deve listar todos os perfis", async () => {
    // Primeiro cria um perfil
    await new Profile({ name: "admin", description: "Admin profile" }).save();

    const res = await request(app).get("/admin/profile");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].name).toBe("admin");
  });

  it("Deve buscar um perfil pelo ID", async () => {
    const profile = await new Profile({
      name: "admin",
      description: "Admin profile",
    }).save();

    const res = await request(app).get(`/admin/profile/${profile._id}`);
    expect(res.status).toBe(200);
    expect(res.body.name).toBe("admin");
  });

  it("Deve atualizar um perfil", async () => {
    const profile = await new Profile({
      name: "admin",
      description: "Admin profile",
    }).save();

    const res = await request(app)
      .put(`/admin/profile/${profile._id}`)
      .send({
        name: "updatedAdmin",
        description: "Updated Admin profile",
        permissions: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.name).toBe("updatedadmin"); // Nome é salvo em lowercase
  });

  it("Deve excluir um perfil", async () => {
    const profile = await new Profile({
      name: "admin",
      description: "Admin profile",
    }).save();

    const res = await request(app).delete(`/admin/profile/${profile._id}`);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Perfil excluído com sucesso");

    const profileDeleted = await Profile.findById(profile._id);
    expect(profileDeleted).toBeNull();
  });

  it("Deve adicionar permissões a um perfil", async () => {
    const profile = await new Profile({
      name: "admin",
      description: "Admin profile",
    }).save();

    const permission1 = await new Permission({
      name: "create_users",
      label: "Criar Usuário",
      description: "Permission to create users",
    }).save();

    const permission2 = await new Permission({
      name: "delete_users",
      label: "Deletar Usuário",
      description: "Permission to delete users",
    }).save();

    const res = await request(app)
      .post("/admin/profile/permissions")
      .send({
        profileId: profile._id,
        permissionIds: [permission1._id, permission2._id],
      });

    expect(res.status).toBe(200);
    expect(res.body.profile.permissions).toHaveLength(2);
    expect(res.body.profile.permissions[0]).toBe(String(permission1._id));
    expect(res.body.profile.permissions[1]).toBe(String(permission2._id));
  });

  it("Deve retornar 404 ao tentar buscar um perfil inexistente", async () => {
    const invalidId = new mongoose.Types.ObjectId();
    const res = await request(app).get(`/admin/profile/${invalidId}`);
    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Perfil não encontrado");
  });

  it("Deve retornar 403 ao tentar editar um perfil protegido", async () => {
    const profile = await new Profile({
      name: "admin",
      description: "Admin profile",
      isProtected: true,
    }).save();

    const res = await request(app)
      .put(`/admin/profile/${profile._id}`)
      .send({
        name: "updatedAdmin",
        description: "Updated Admin profile",
        permissions: [],
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe("Não é possível editar um perfil protegido");
  });

  it("Deve retornar 403 ao tentar excluir um perfil protegido", async () => {
    const profile = await new Profile({
      name: "admin",
      description: "Admin profile",
      isProtected: true,
    }).save();

    const res = await request(app).delete(`/admin/profile/${profile._id}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "Não é possível excluir um perfil protegido"
    );
  });

  it("Deve retornar 403 ao tentar excluir um perfil vinculado a um usuário", async () => {
    const profile = await new Profile({
      name: "admin",
      description: "Admin profile",
    }).save();

    const senhaHash = await argon2.hash("senhaSegura")
    await new Usuario({
      nome: "Usuário Teste",
      email: "usuario@teste.com",
      senha: senhaHash,
      profile: profile._id,
      admin: false,
      ativo: true
    }).save();

    const res = await request(app).delete(`/admin/profile/${profile._id}`);
    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "Não é possível excluir um perfil vinculado a um ou mais usuários"
    );
  });
});
