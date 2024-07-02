"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const ReciboService_1 = require("../service/ReciboService");
class ReciboController {
    /**
     * Gera o recibo em formato PDF com base no ID da declaração fornecido na requisição.
     *   @param req.params - Parâmetros da rota:
     *     @param idDeclaracao - ID da declaração para a qual o recibo será gerado.
  
     */
    async gerarRecibo(req, res) {
        try {
            const { idDeclaracao } = req.params;
            if (!mongoose_1.default.Types.ObjectId.isValid(idDeclaracao)) {
                res.status(400).json({ error: "ID inválido." });
                return;
            }
            const declaracaoId = new mongoose_1.default.Types.ObjectId(idDeclaracao);
            const pdfBuffer = await (0, ReciboService_1.gerarPDFRecibo)(declaracaoId);
            res.setHeader('Content-Disposition', 'attachment; filename=recibo.pdf');
            res.setHeader('Content-Type', 'application/pdf');
            res.send(pdfBuffer);
        }
        catch (error) {
            console.error("Erro ao gerar o recibo:", error);
            res.status(500).json({ error: "Erro ao gerar o recibo." });
        }
    }
}
exports.default = ReciboController;
