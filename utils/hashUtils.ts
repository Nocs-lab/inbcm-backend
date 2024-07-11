// utils/hashUtils.ts

import crypto from 'crypto';
import mongoose from 'mongoose';

// função para criar o hash da declaração
export function createHash(idDeclaracao: mongoose.Types.ObjectId, salt: string): string {
    const dataString = `${idDeclaracao.toString()}${salt}`;
    const hash = crypto.createHash('sha256').update(dataString).digest('hex');
    return hash;
}

// função para gerar um salt
export function generateSalt(): string {
    return crypto.randomBytes(16).toString('hex');
}

// função para criar o hash do arquivo
export function createHashUpdate(filePath: string, fileName: string): string {
    const dataString = `${filePath}${fileName}`;
    const hash = crypto.createHash('sha256').update(dataString).digest('hex');
    return hash;
}
