"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const models_1 = require("../models");
class MuseuController {
    // Método para criar um novo museu
    static async criarMuseu(req, res) {
        try {
            const { nome, endereco, codIbram, esferaAdministraiva, usuario } = req.body;
            if (!nome || !endereco || !endereco.cidade || !endereco.logradouro || !endereco.numero) {
                return res.status(400).json({ mensagem: "Todos os campos obrigatórios devem ser preenchidos." });
            }
            const novoMuseu = new models_1.Museu({
                nome,
                endereco,
                codIbram,
                esferaAdministraiva,
                usuario
            });
            await novoMuseu.save();
            return res.status(201).json({ mensagem: "Museu criado com sucesso!", museu: novoMuseu });
        }
        catch (erro) {
            console.error("Erro ao criar museu:", erro);
            return res.status(500).json({ mensagem: "Erro ao criar museu." });
        }
    }
    static async listarMuseus(req, res) {
        try {
            const museus = await models_1.Museu.find();
            return res.status(200).json(museus);
        }
        catch (erro) {
            console.error("Erro ao listar museus:", erro);
            return res.status(500).json({ mensagem: "Erro ao listar museus." });
        }
    }
    static async userMuseus(req, res) {
        try {
            const user_id = req.body.user.sub;
            const museus = await models_1.Museu.find({ usuario: user_id });
            return res.status(200).json(museus);
        }
        catch (erro) {
            console.error("Erro ao listar museus do usuário:", erro);
            return res.status(500).json({ mensagem: "Erro ao listar museus do usuário." });
        }
    }
}
exports.default = MuseuController;
