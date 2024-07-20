import { Request, Response } from "express";
import argon2 from "@node-rs/argon2";
import Usuario from "../models/Usuario"; // Atualize o caminho conforme necessário

class UsuarioController {
  async registerUsuarioByAdmin(req: Request, res: Response) {
    const { nome, email, senha, museus, profile } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ mensagem: 'Nome, email e senha são obrigatórios.' });
    }
    if(!profile){
      return res.status(400).json({ mensagem: 'O usuário precisa ter um perfil.' });
    }

    //codigo para buscar o perfil
    if (!/^[A-Za-zÀ-ÿ ]+$/.test(nome)) {
      return res.status(400).json({ mensagem: 'O campo nome deve conter apenas letras e espaços.' });
    }

    try {
      const usuarioExistente = await Usuario.findOne({ email });
      if (usuarioExistente) {
        return res.status(400).json({ mensagem: "Email já está em uso." });
      }
      const senhaHash = await argon2.hash(senha);
      const novoUsuario = new Usuario({
        nome, email, senha: senhaHash, museus, profile
      });

      await novoUsuario.save();

      return res.status(201).json({ mensagem: 'Usuário criado com sucesso.' });
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ mensagem: 'Erro ao criar usuário.' });
    }
  }

  async getUsuarios(req: Request, res: Response) {
    try {
      const usuarios = await Usuario.find({ativo: true}).populate('profile');
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
    const { nome, email, senha, museus, profile, ativo } = req.body;
    console.log(req.body);

    const usuario = await Usuario.findById(id);
      if (!usuario) {
        return res.status(404).json({ mensagem: "Usuário não encontrado." });
      }

    if (email !== usuario.email){
      const usuarioExistente = await Usuario.findOne({ email });
      if (usuarioExistente) {
        return res.status(400).json({ mensagem: "Email já está em uso." });
      }
    }

    try {
      if (nome) usuario.nome = nome;
      if (email) usuario.email = email;
      if (senha) usuario.senha = await argon2.hash(senha);
      if (museus) usuario.museus = museus;
      if (profile) usuario.profile = profile;
      if (ativo !== undefined) usuario.ativo = ativo;

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

      await Usuario.updateOne({ _id: id }, { ativo: false });

      return res.status(200).json({ mensagem: "Usuário deletado com sucesso." });
    } catch (error) {
      console.error("Erro ao deletar usuário:", error);
      return res.status(500).json({ mensagem: "Erro ao deletar usuário." });
    }
  }

}

export default new UsuarioController();
