import { Request, Response } from 'express';
import { Profile } from '../models/Profile';
import { Permission } from '../models/Permission';
import mongoose, { Types } from 'mongoose';
import { Usuario } from '../models';

class ProfileController {

  public async addPermissions(req: Request, res: Response): Promise<void> {
    try {
      const { profileId, permissionIds } = req.body;

      if (!profileId || !permissionIds || !Array.isArray(permissionIds)) {
        res.status(400).json({ message: 'É preciso enviar uma ou mais permissões.' });
        return;
      }

      const profile = await Profile.findById(profileId);
      if (!profile) {
        res.status(404).json({ message: 'Permissão não encontrada.' });
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

      res.status(200).json({ message: 'Permissão atualizada com sucesso.', profile });
    } catch (error) {
      res.status(500).json({ message: 'Erro ao atualizar permissão:', error });
    }
  }

  public async createProfile(req: Request, res: Response): Promise<Response> {
    try {
      let { name, description, permissions } = req.body;

      // Converte o nome p/ letras minúsculas antes de salvar no banco
      name = name.toLowerCase();

      const profile = new Profile({ name, description, permissions });
      await profile.save();

      return res.status(201).json(profile);
    } catch (error) {
      console.error("Erro ao criar o perfil do usuário:", error);
      return res.status(500).json({ message: "Erro ao criar o perfil do usuário" });
    }
  }

  public async getProfiles(req: Request, res: Response): Promise<Response> {
    console.log(22)
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
      let { name, description, permissions } = req.body;

      name = name.toLowerCase();

      const profile = await Profile.findById(id).select('+isProtected');
      if (!profile) {
        return res.status(404).json({ message: 'Perfil não encontrado' });
      }
      if (profile.isProtected) {
        return res.status(403).json({ message: 'Não é possível editar um perfil protegido' });
      }

      const updatedProfile = await Profile.findByIdAndUpdate(
        id,
        { name, description, permissions },
        { new: true }
      );

      return res.status(200).json(updatedProfile);
    } catch (error) {
      console.error("Erro ao atualizar o perfil do usuário:", error);
      return res.status(500).json({ message: "Erro ao atualizar o perfil do usuário" });
    }
  }



  public async deleteProfile(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;
      const profile = await Profile.findById(id).select('+isProtected');
      if (!profile) {
        return res.status(404).json({ message: 'Perfil não encontrado' });
      }
      if (profile.isProtected) {
        return res.status(403).json({ message: 'Não é possível excluir um perfil protegido' });
      }
      // Verifica se algum usuário está vinculado ao perfil
      const userWithProfile = await Usuario.findOne({ profile: id });
      if (userWithProfile) {
        return res.status(403).json({ message: 'Não é possível excluir um perfil vinculado a um ou mais usuários' });
      }
      await Profile.findByIdAndDelete(id);
      return res.status(200).json({ message: 'Perfil excluído com sucesso' });
    } catch (error) {
      console.error("Erro ao excluir o perfil do usuário:", error);
      return res.status(500).json({ message: "Erro ao excluir o perfil do usuário" });
    }
  }

}

export default new ProfileController();
