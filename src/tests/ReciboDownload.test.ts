import request from "supertest";
import path from "path";
import {
  app,
  setupTestEnvironment,
  teardownTestEnvironment,
  museuMock,
} from "./DeclaracaoMockSetup";
import mongoose from "mongoose";

let declaracaoId: string;
const filePathMuseologico2itens = path.join(
  __dirname,
  "./assets/museologico2itens.xlsx"
);
const filePathArquivistico4itens = path.join(
  __dirname,
  "./assets/arquivistico4itens.xlsx"
);
const filePathBibliografico3itens = path.join(
  __dirname,
  "./assets/bibliografico3itens.xlsx"
);

beforeAll(async () => {
  await setupTestEnvironment();
});

afterAll(async () => {
  await teardownTestEnvironment();
});

describe("POST /public/declaracoes/uploads/:museu/:anoDeclaracao", () => {
  it("Deve enviar um arquivo Excel museológico, arquivistico e bibliográfico e verificar se a resposta recebe status code 200 e contém os dados corretos do museu, ano da declaração e status", async () => {
    const response = await request(app)
      .post(`/public/declaracoes/uploads/${museuMock._id}/2024`)
      .set("Authorization", `Bearer mocked-token`)
      .attach("museologico", filePathMuseologico2itens)
      .attach("arquivistico", filePathArquivistico4itens)
      .attach("bibliografico", filePathBibliografico3itens)
      .expect(200);

    const museuId = museuMock._id as unknown as mongoose.Types.ObjectId;

    expect(response.body).toHaveProperty("museu_id", museuId.toString());
    expect(response.body).toHaveProperty("anoDeclaracao", "2024");
    expect(response.body).toHaveProperty("status", "Recebida");
    expect(response.body.museologico.quantidadeItens).toBe(2);
    expect(response.body.arquivistico.quantidadeItens).toBe(4);
    expect(response.body.bibliografico.quantidadeItens).toBe(3);

    declaracaoId = response.body._id; 
  });
});

describe("GET /public/declaracoes/:id", () => {
  it("Deve buscar uma declaração pelo seu id", async () => {
    const response = await request(app)
      .get(`/public/declaracoes/${declaracaoId}`)
      .set("Authorization", `Bearer mocked-token`)
      .expect(200);
    

    expect(response.body).toHaveProperty("anoDeclaracao", "2024");
    expect(response.body).toHaveProperty("status", "Recebida");

  
    return response.body; 
  });
});

describe("GET /public/recibo/:idDeclaracao", () => {
  it("Deve gerar e retornar um recibo PDF corretamente", async () => {
    const declaracaoResponse = await request(app)
      .get(`/public/declaracoes/${declaracaoId}`)
      .set("Authorization", `Bearer mocked-token`)
      .expect(200);
    

    const response = await request(app)
      .get(`/public/recibo/${declaracaoId}`)
      .set("Authorization", `Bearer mocked-token`)
      .expect(200);

    expect(response.headers["content-disposition"]).toContain("attachment; filename=recibo.pdf");
    expect(response.headers["content-type"]).toBe("application/pdf");
    console.log("Response Headers:", response.headers);
    console.log("Response Body Length:", response.body.length);
    
    expect(response.body).toBeInstanceOf(Buffer);
  });
  
});
