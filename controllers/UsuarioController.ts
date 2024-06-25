import { Request, Response } from "express";
import argon2 from "argon2";
import Usuario from "../models/Usuario"; // Atualize o caminho conforme necessário

class UsuarioController {
  async registerUsuario(req: Request, res: Response) {
    const { nome, email, senha, museus, profile } = req.body;
    // Verificação de campos obrigatórios
    if (!nome || !email || !senha) {
      return res.status(400).json({ mensagem: "Nome, email e senha são obrigatórios." });
    }
    if(!profile){
      return res.status(400).json({ mensagem: "O usuário precisa ter um perfil." });
    }

    try {
      const usuarioExistente = await Usuario.findOne({ email });
      if (usuarioExistente) {
        return res.status(400).json({ mensagem: "Email já está em uso." });
      }
      // Hash da senha com Argon2
      const senhaHash = await argon2.hash(senha);
      // Criar o novo usuário
      const novoUsuario = new Usuario({
        nome,
        email,
        senha: senhaHash,
        museus,
        profile
      });

      await novoUsuario.save();

      return res.status(201).json({ mensagem: "Usuário criado com sucesso." });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return res.status(500).json({ mensagem: "Erro ao criar usuário." });
    }
  }

  async getUsuarios(req: Request, res: Response) {
    try {
      const usuarios = await Usuario.find().populate('profile');
      return res.status(200).json(usuarios);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return res.status(500).json({ mensagem: "Erro ao listar usuários." });
    }
  }

  async getUsuarioPorId(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const usuario = await Usuario.findById(id).populate('profile');
      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." });
      }
      return res.status(200).json(usuario);
    } catch (error) {
      console.error("Erro ao buscar usuário:", error);
      return res.status(500).json({ mensagem: "Erro ao buscar usuário." });
    }
  }

  async atualizarUsuario(req: Request, res: Response) {
    const { id } = req.params;
    const { nome, email, senha, museus, profile } = req.body;
    //colocar validação para verificar o id do usuário

    try {
      const usuario = await Usuario.findById(id);
      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." });
      }

      if (nome) usuario.nome = nome;
      if (email) usuario.email = email;
      if (senha) usuario.senha = await argon2.hash(senha);
      if (museus) usuario.museus = museus;
      if (profile) usuario.profile = profile;

      await usuario.save();

      return res.status(200).json({ mensagem: "Usuário atualizado com sucesso." });
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return res.status(500).json({ mensagem: "Erro ao atualizar usuário." });
    }
  }

  async deletarUsuario(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const usuario = await Usuario.findById(id);
      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." });
      }

      await Usuario.deleteOne({ _id: id });

      return res.status(200).json({ mensagem: "Usuário deletado com sucesso." });
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      return res.status(500).json({ mensagem: "Erro ao deletar usuário." });
    }
  }

}

export default new UsuarioController();
