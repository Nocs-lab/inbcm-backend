import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import { Permission } from "../models/Permission";
import PermissionController from "../controllers/PermissionController"; // Ajuste o caminho conforme necessário

const app = express();
app.use(express.json());
app.use("/admin/permissions", PermissionController.getPermissions);

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

describe("GET /admin/permissions", () => {
  it("Deve retornar uma lista de permissões", async () => {
    // Crie algumas permissões de exemplo no banco de dados
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

    const res = await request(app).get("/admin/permissions");

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body[0].name).toBe("create_users");
    expect(res.body[1].name).toBe("delete_users");
  });

});
