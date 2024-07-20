import { Request, Response } from 'express';
import { Permission } from '../models/Permission';

class PermissionController {

  public async getPermissions(req: Request, res: Response): Promise<Response> {
    try {
      const permissions = await Permission.find();
      return res.status(200).json(permissions);
    } catch (error) {
      console.error("Erro ao buscar permissões:", error);
      return res.status(500).json({ message: "Não foi possível listar permissões" });
    }
  }
}

export default new PermissionController();
