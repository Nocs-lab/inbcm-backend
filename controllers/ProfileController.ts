import { Request, Response } from 'express';
import { Profile } from '../models/Profile';

class ProfileController {

  public async createProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { name, permissions } = req.body;
      const profile = new Profile({ name, permissions });
      await profile.save();
      return res.status(201).json(profile);
    } catch (error) {
      console.error("Erro ao criar o perfil do usuário:", error);
      return res.status(500).json({ message: "Erro ao criar o perfil do usuário" });
    }
  }

  public async getProfiles(req: Request, res: Response): Promise<Response> {
    try {
      const profiles = await Profile.find();
      return res.status(200).json(profiles);
    } catch (error) {
      console.error("Erro ao listar os perfis dos usuários:", error);
      return res.status(500).json({ message: "Erro ao listar os perfis dos usuários" });
    }
  }

  public async getProfileById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const profile = await Profile.findById(id);
      if (!profile) {
        return res.status(404).json({ message: 'Perfil não encontrado' });
      }
      return res.status(200).json(profile);
    } catch (error) {
      console.error("Erro ao buscar o perfil do usuário:", error);
      return res.status(500).json({ message: "Erro ao buscar o perfil do usuário" });
    }
  }

  public async updateProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, permissions } = req.body;
      const profile = await Profile.findByIdAndUpdate(id, { name, permissions }, { new: true });
      if (!profile) {
        return res.status(404).json({ message: 'Perfil não encontrado' });
      }
      return res.status(200).json(profile);
    } catch (error) {
      console.error("Erro ao atualizar o perfil do usuário:", error);
      return res.status(500).json({ message: "Erro ao atualizar o perfil do usuário" });
    }
  }

  public async deleteProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const profile = await Profile.findByIdAndDelete(id);
      if (!profile) {
        return res.status(404).json({ message: 'Perfil não encontrado' });
      }
      return res.status(200).json({ message: 'Perfil excluído' });
    } catch (error) {
      console.error("Erro ao excluir o perfil do usuário:", error);
      return res.status(500).json({ message: "Erro ao excluir o perfil do usuário" });
    }
  }
}

export default new ProfileController();
