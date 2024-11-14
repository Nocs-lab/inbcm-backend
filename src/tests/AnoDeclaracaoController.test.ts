import request from 'supertest';
import mongoose from 'mongoose';
import express from "express";
import { MongoMemoryServer } from "mongodb-memory-server";
import AnoDeclaracaoController from "../controllers/AnoDeclaracaoController";

const app = express();
app.use(express.json());

let mongoServer: MongoMemoryServer;

// Definindo as rotas manualmente para o AnoDeclaracaoController
app.post("/admin/anoDeclaracao", AnoDeclaracaoController.criarAnoDeclaracao);
app.get("/admin/anoDeclaracao", AnoDeclaracaoController.getAnoDeclaracao);
app.get("/admin/anoDeclaracao/:id", AnoDeclaracaoController.getAnoDeclaracaoById);
app.put("/admin/anoDeclaracao/:id", AnoDeclaracaoController.updateAnoDeclaracao);
app.delete("/admin/anoDeclaracao/:id", AnoDeclaracaoController.deleteAnoDeclaracao);




describe('AnoDeclaracaoController', () => {
  let anoDeclaracaoId: string;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
  });

  describe('POST /admin/anoDeclaracao', () => {
    it('deve criar um novo ano de declaração', async () => {
      const res = await request(app).post('/admin/anoDeclaracao').send({
        ano: 2024,
        dataInicioSubmissao: '2024-01-01',
        dataFimSubmissao: '2024-02-01',
        dataInicioRetificacao: '2024-03-01',
        dataFimRetificacao: '2024-04-01',
        metaDeclaracoesEnviadas: 100,
      });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.ano).toBe(2024);

      anoDeclaracaoId = res.body._id;
    });

    it('deve retornar erro ao tentar criar um ano de declaração duplicado', async () => {
      const res = await request(app).post('/admin/anoDeclaracao').send({
        ano: 2024,
        dataInicioSubmissao: '2024-01-01',
        dataFimSubmissao: '2024-02-01',
        dataInicioRetificacao: '2024-03-01',
        dataFimRetificacao: '2024-04-01',
        metaDeclaracoesEnviadas: 100,
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe(`Já existe um ano de declaração para o ano 2024.`);
    });
  });

  describe('GET /admin/anoDeclaracao', () => {
    it('deve listar todos os anos de declaração', async () => {
      const res = await request(app).get('/admin/anoDeclaracao');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
    });

    it('deve limitar a quantidade de anos de declaração retornados', async () => {
      const res = await request(app).get('/admin/anoDeclaracao?quantidadeAnoDeclaracao=1');
      expect(res.status).toBe(200);
      expect(res.body.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /admin/anoDeclaracao/:id', () => {
    it('deve buscar um ano de declaração pelo ID', async () => {
      const res = await request(app).get(`/admin/anoDeclaracao/${anoDeclaracaoId}`);
      expect(res.status).toBe(200);
      expect(res.body._id).toBe(anoDeclaracaoId);
    });

    it('deve retornar erro ao buscar um ID inexistente', async () => {
      const res = await request(app).get('/admin/anoDeclaracao/000000000000000000000000');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Ano de declaração não encontrado');
    });
  });

  describe('PUT /admin/anoDeclaracao/:id', () => {
    it('deve atualizar um ano de declaração existente', async () => {
      const res = await request(app).put(`/admin/anoDeclaracao/${anoDeclaracaoId}`).send({
        dataInicioSubmissao: '2024-01-10',
        dataFimSubmissao: '2024-02-10',
        dataInicioRetificacao: '2024-03-10',
        dataFimRetificacao: '2024-04-10',
        metaDeclaracoesEnviadas: 150,
      });

      expect(res.status).toBe(200);
      expect(res.body.metaDeclaracoesEnviadas).toBe(150);
    });

    it('deve retornar erro ao atualizar um ano de declaração inexistente', async () => {
      const res = await request(app).put('/admin/anoDeclaracao/000000000000000000000000').send({
        metaDeclaracoesEnviadas: 200,
      });

      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Ano de declaração não encontrado');
    });
  });

  describe('DELETE /admin/anoDeclaracao/:id', () => {
    it('deve excluir um ano de declaração existente', async () => {
      const res = await request(app).delete(`/admin/anoDeclaracao/${anoDeclaracaoId}`);
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Ano de declaração excluído com sucesso');
    });

    it('deve retornar erro ao excluir um ano de declaração inexistente', async () => {
      const res = await request(app).delete('/admin/anoDeclaracao/000000000000000000000000');
      expect(res.status).toBe(404);
      expect(res.body.message).toBe('Ano de declaração não encontrado');
    });
  });
});
