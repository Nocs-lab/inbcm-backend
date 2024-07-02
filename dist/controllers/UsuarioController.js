"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Usuario_1 = require("../models/Usuario");
class UsuarioController {
    async criarUsuario(req, res) {
        try {
            const { nome, acervo, museu, ano } = req.body;
            // Crie um novo usuário com os dados fornecidos
            const usuario = new Usuario_1.Usuario({
                nome,
                acervo,
                museu,
                ano,
            });
            // Salve o usuário no banco de dados
            await usuario.save();
            return res.status(200).json({ success: true, message: "Usuário criado com sucesso.", usuario });
        }
        catch (error) {
            console.error("Erro ao criar usuário:", error);
            return res.status(500).json({ success: false, message: "Erro ao criar usuário." });
        }
    }
}
exports.default = new UsuarioController();
