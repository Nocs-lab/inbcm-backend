import DeclaracaoService from "../service/declaracao/DeclaracaoService";

async function validarDeclaracaoExistente(req, res, next) {
  const { anoDeclaracao } = req.params;

  try {
    // Verificar se a declaração existe
    const declaracaoService = new DeclaracaoService();
    const declaracaoExistente = await declaracaoService.verificarDeclaracaoExistente(anoDeclaracao);

    if (!declaracaoExistente) {
      return res.status(404).json({ error: 'Declaração não encontrada.' });
    }

    // Se a declaração existe, permita o upload
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao verificar a existência da declaração.' });
  }
}

export default validarDeclaracaoExistente;
