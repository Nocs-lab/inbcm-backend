import { Request, Response } from 'express';
import { Profile } from '../models/Profile';
import { Permission } from '../models/Permission';
import mongoose, { Types } from 'mongoose';

class ProfileController {

  public async addPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { profileId, permissionIds } = req.body;

      if (!profileId || !permissionIds || !Array.isArray(permissionIds)) {
        res.status(400).json({ message: 'Profile ID and an array of Permission IDs are required.' });
        return;
      }

      const profile = await Profile.findById(profileId);
      if (!profile) {
        res.status(404).json({ message: 'Profile not found.' });
        return;
      }

      const validPermissionIds: mongoose.Types.ObjectId[] = [];
      for (const id of permissionIds) {
        const permission = await Permission.findById(id);
        if (permission) {
          validPermissionIds.push(permission._id as mongoose.Types.ObjectId);
        } else {
          res.status(404).json({ message: `Permission not found for ID: ${id}` });
          return;
        }
      }

      profile.permissions = validPermissionIds; // Reseta as permissões existentes e adiciona as novas permissões
      await profile.save();

      res.status(200).json({ message: 'Permissions added successfully.', profile });
    } catch (error) {
      res.status(500).json({ message: 'An error occurred.', error });
    }
  }



  public async createProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description, permissions } = req.body;
      const profile = new Profile({ name, description, permissions });
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
      const { name, description, permissions } = req.body;
      const profile = await Profile.findByIdAndUpdate(id, { name, description, permissions }, { new: true });
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
