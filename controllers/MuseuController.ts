import { Request, Response } from "express";
import Museu from "../models/Museu";

class MuseuController {

  // Método para criar um novo museu
  static async criarMuseu(req: Request, res: Response) {
    try {
      const { nome, endereco } = req.body;
      if (!nome || !endereco || !endereco.cidade || !endereco.rua) {
        return res.status(400).json({ mensagem: "Todos os campos obrigatórios devem ser preenchidos." });
      }
      const novoMuseu = new Museu({
        nome,
        endereco
      });
      await novoMuseu.save();

      return res.status(201).json({ mensagem: "Museu criado com sucesso!", museu: novoMuseu });
    } catch (erro) {
      console.error("Erro ao criar museu:", erro);
      return res.status(500).json({ mensagem: "Erro ao criar museu." });
    }
  }

  static async listarMuseus(req: Request, res: Response) {
    try {
      const museus = await Museu.find();
      return res.status(200).json(museus);
    } catch (erro) {
      console.error("Erro ao listar museus:", erro);
      return res.status(500).json({ mensagem: "Erro ao listar museus." });
    }
  }


}



export default MuseuController;
