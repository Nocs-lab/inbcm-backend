import Usuario from "../models/Usuario";
import { Request, Response } from "express";

class UsuarioController {
  async criarUsuario(req: Request, res: Response) {
    try {
      const { nome, acervo, museu, ano } = req.body;

      // Crie um novo usuário com os dados fornecidos
      const usuario = new Usuario({
        nome,
        acervo,
        museu,
        ano,
      });

      // Salve o usuário no banco de dados
      await usuario.save();

      return res.status(200).json({ success: true, message: "Usuário criado com sucesso.", usuario });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return res.status(500).json({ success: false, message: "Erro ao criar usuário." });
    }
  }
}

export default new UsuarioController();
