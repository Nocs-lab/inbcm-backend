import mongoose from 'mongoose';
import User from '../models/Usuario';
import { Museu } from '../models';

export class MuseuHelper {
    static async getEmailsFromMuseuUsers(museuId: string): Promise<string[]> {
        try {
            const museu = await Museu.findById(museuId);

            if (!museu) {
                throw new Error('Museu não encontrado');
            }

            const users = await User.find({ _id: { $in: museu.usuario } }).select('email');

            return users.map(user => user.email);
        } catch (error) {
            console.error('Erro ao buscar e-mails:', error);
            return [];
        }
    }
}
