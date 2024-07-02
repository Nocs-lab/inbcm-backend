"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gerarData = gerarData;
function gerarData(date) {
    const data = date || new Date();
    return data.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
}
