
// import Declaracoes from '../../../models/Declaracao'
// import {testServer} from '../../jest.setup'


// describe('Server status', () => {
//     it('deve retornar status 200 para rota raiz', async () => {
//       const response = await testServer.get('/');
//       expect(response.status).toBe(200);
//     });
//   });

// describe('DeclaracaoController', () => {
//   describe('GET /declaracoes/:anoDeclaracao', () => {
//     it('deve retornar uma declaração para o ano especificado', async () => {
//       const response = await testServer.get('/declaracoes/2023');
//       expect(response.status).toBe(200);
     
//     });

//     it('deve retornar 404 se a declaração não for encontrada para o ano especificado', async () => {
//       const response = await testServer.get('/declaracoes/2022');
//       expect(response.status).toBe(404);
      
//     });
//   });

//   describe('GET /declaracoes', () => {
//     it('deve retornar uma lista de declarações', async () => {
//       const response = await testServer.get('/declaracoes');
//       expect(response.status).toBe(200);
      
//     });

//     it('deve retornar 404 se nenhuma declaração for encontrada', async () => {
    
//       jest.spyOn(Declaracoes, 'find').mockResolvedValueOnce([]);
      
//       const response = await testServer.get('/declaracoes');
//       expect(response.status).toBe(404);
      
//     });
//   });

//   describe('PUT /uploads/:anoDeclaracao', () => {
//     it('deve enviar uma declaração com sucesso', async () => {
//       const response = await testServer.put('/uploads/2023');
//       expect(response.status).toBe(200);
//       expect(response.body).toHaveProperty('message', 'Declaração enviada com sucesso!');
     
//     });
//   });
// });
