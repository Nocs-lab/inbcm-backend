// utils/hashUtils.ts

import crypto from 'crypto';

// função parar criar o hash da declaração
export function createHash(data: { anoDeclaracao: string; museu_id: string }): string {
    const dataString = `${data.anoDeclaracao}${data.museu_id.toString()}`;
    const hash = crypto.createHash('sha256').update(dataString).digest('hex');
    return hash;
}

// função para criar o hash do arquivo
export function createHashUpdate(filePath: string, fileName: string): string {
    const dataString = `${filePath}${fileName}`;
    const hash = crypto.createHash('sha256').update(dataString).digest('hex');
    return hash;
}
