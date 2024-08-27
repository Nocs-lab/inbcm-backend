import request from 'supertest';
import path from 'path';
import { app, setupTestEnvironment, teardownTestEnvironment, museuMock } from './DeclaracaoMockSetup';
import mongoose from 'mongoose';

beforeAll(async () => {
  await setupTestEnvironment();
});

afterAll(async () => {
  await teardownTestEnvironment();
});

describe('POST /uploads/:museu/:anoDeclaracao', () => {
  it('Deve enviar um arquivo Excel museológico e verificar se a resposta recebe status code 200 e contém os dados corretos do museu, ano da declaração e status', async () => {
    const filePath = path.join(__dirname, './assets/museologico.xlsx');

    const response = await request(app)
      .post(`/uploads/${museuMock._id}/2024`)
      .set('Authorization', `Bearer mocked-token`)
      .attach('museologico', filePath)
      .expect(200);

    let museuId = museuMock._id as unknown as mongoose.Types.ObjectId

    expect(response.body).toHaveProperty('museu_id', museuId.toString());
    expect(response.body).toHaveProperty('anoDeclaracao', '2024');
    expect(response.body).toHaveProperty('status', 'Recebida');
  });

  it('Deve retornar erro 406 se tentar criar uma declaração com ano referência e museu já utilizados', async () => {
    const filePath = path.join(__dirname, './assets/museologico.xlsx');

    const response = await request(app)
      .post(`/uploads/${museuMock._id}/2024`)
      .set('Authorization', `Bearer mocked-token`)
      .attach('museologico', filePath)
      .expect(406); //
   
  });
});
