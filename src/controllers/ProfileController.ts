import { Request, Response } from 'express';
import { Profile } from '../models/Profile';
import { Permission } from '../models/Permission';
import mongoose, { Types } from 'mongoose';

class ProfileController {

  public async addPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { profileId, permissionIds } = req.body;

      if (!profileId || !permissionIds || !Array.isArray(permissionIds)) {
        res.status(400).json({ message: 'Não foi possível identificar o perfil ou permissões do usuário.' });
        return;
      }

      const profile = await Profile.findById(profileId);
      if (!profile) {
        res.status(404).json({ message: 'Perfil não encontrado.' });
        return;
      }

      const validPermissionIds: mongoose.Types.ObjectId[] = [];
      for (const id of permissionIds) {
        const permission = await Permission.findById(id);
        if (permission) {
          validPermissionIds.push(permission._id as mongoose.Types.ObjectId);
        } else {
          res.status(404).json({ message: `Permissão não encontrada para o ID: ${id}` });
          return;
        }
      }

      profile.permissions = validPermissionIds; // Reseta as permissões existentes e adiciona as novas permissões
      await profile.save();

      res.status(200).json({ message: 'Permissões adicionadas com sucesso.', profile });
    } catch (error) {
      res.status(500).json({ message: 'Ocorreu um erro,', error });
    }
  }



  public async createProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { name, description, permissions } = req.body;

      const existingProfile = await Profile.findOne({ name });
      if (existingProfile) {
        return res.status(400).json({ message: 'O nome fornecido já está em uso.' });
      }

      const profile = new Profile({ name, description, permissions });
      await profile.save();
      return res.status(201).json(profile);
    } catch (error) {
      console.error('Erro ao criar o perfil do usuário:', error);
      return res.status(500).json({ message: 'Erro ao criar o perfil do usuário.' });
    }
  }

  public async getProfiles(req: Request, res: Response): Promise<Response> {
    try {
      const profiles = await Profile.find().populate('permissions');
      return res.status(200).json(profiles);
    } catch (error) {
      console.error('Erro ao listar os perfis dos usuários:', error);
      return res.status(500).json({ message: 'Erro ao listar os perfis dos usuários.' });
    }
  }

  public async getProfileById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const profile = await Profile.findById(id);
      if (!profile) {
        return res.status(404).json({ message: 'Perfil não encontrado.' });
      }
      return res.status(200).json(profile);
    } catch (error) {
      console.error('Erro ao buscar o perfil do usuário:', error);
      return res.status(500).json({ message: 'Erro ao buscar o perfil do usuário.' });
    }
  }

  public async updateProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const { name, description, permissions } = req.body;
      const profile = await Profile.findById(id);
      if (!profile) {
        return res.status(404).json({ message: 'Perfil não encontrado.' });
      }
      const existingProfile = await Profile.findOne({ name, _id: { $ne: id } });
      if (existingProfile) {
        return res.status(400).json({ message: 'O nome fornecido já está em uso.' });
      }

      await Profile.findByIdAndUpdate(id, { name, description, permissions }, { new: true });
      const updatedProfile = await Profile.findByIdAndUpdate(id, { name, description, permissions }, { new: true });

      return res.status(200).json(updatedProfile);
    } catch (error) {
      console.error('Erro ao atualizar o perfil do usuário:', error);
      return res.status(500).json({ message: 'Erro ao atualizar o perfil do usuário.' });
    }
  }

  public async deleteProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const profile = await Profile.findByIdAndDelete(id);

      if (!profile) {
        return res.status(404).json({ message: 'Perfil não encontrado.' });
      }

      if (profile.isProtected == true){
        return res.status(403).json({ message: 'Não é possível excluir esse perfil de usuário.' });
      }

      return res.status(200).json({ message: 'Perfil excluído com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir o perfil do usuário:', error);
      return res.status(500).json({ message: 'Erro ao excluir o perfil do usuário.' });
    }
  }
}

export default new ProfileController();
