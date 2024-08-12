import { Request, Response } from 'express';
import MuseuController from '../controllers/MuseuController';

jest.mock('../models', () => ({
  Museu: {
    find: jest.fn().mockResolvedValue([])
  }
}));

describe('MuseuController', () => {
  describe('listarMuseus', () => {
    it('retornar status 200', async () => {
      const req = {} as Request;
      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      } as unknown as Response;

      await MuseuController.listarMuseus(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
    });
  });
});
