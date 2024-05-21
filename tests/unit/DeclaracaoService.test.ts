import DeclaracaoService from '../../service/DeclaracaoService';
import Declaracoes from '../../models/Declaracao';


jest.mock('crypto', () => ({
  createHash: jest.fn(() => ({
    digest: jest.fn(() => 'mockedHash'),
  })),
}));

// Mock da função create do modelo Declaracoes
jest.mock('../../models/Declaracao', () => ({
  create: jest.fn((data: any) => Promise.resolve(data)),
  findOne: jest.fn(),
}));

describe('DeclaracaoService', () => {
  let declaracaoService: DeclaracaoService;

  beforeEach(() => {
    declaracaoService = new DeclaracaoService();
  });

  describe('criarDeclaracao', () => {
    it('deve criar uma nova declaração com os dados fornecidos', async () => {
      const novaDeclaracao = await declaracaoService.criarDeclaracao('2023');

      expect(novaDeclaracao.anoDeclaracao).toBe('2023');
      expect(novaDeclaracao.responsavelEnvio).toBe('Thiago Campos');
      expect(novaDeclaracao.hashDeclaracao).toBe('mockedHash');
      expect(novaDeclaracao.dataCriacao).toBeInstanceOf(Date);
      expect(novaDeclaracao.status).toBe('em análise');
    });

    it('deve lançar um erro se ocorrer um erro ao criar a declaração', async () => {
      // Simulando um erro ao criar a declaração
      jest.spyOn(Declaracoes, 'create').mockRejectedValueOnce(new Error('Erro ao criar declaração'));

      await expect(declaracaoService.criarDeclaracao('2023')).rejects.toThrow('Erro ao criar declaração');
    });
  });
  describe('atualizarArquivistico', () => {
    it('deve atualizar os dados arquivísticos de uma declaração existente', async () => {
      // Dados de teste
      const anoDeclaracao = '2023';
      const dadosArquivistico = { /* dados de teste */ };
      const declaracaoMock = {
        _id: 'id-da-declaracao',
        arquivistico: { /* dados existentes de arquivísticos */ },
        save: jest.fn().mockResolvedValueOnce({ /* nova declaração atualizada */ }),
      };

      // Mock para Declaracoes.findOne
      (Declaracoes.findOne as jest.Mock).mockResolvedValueOnce(declaracaoMock);

      // Chama o método
      const resultado = await declaracaoService.atualizarArquivistico(anoDeclaracao, dadosArquivistico);

      // Verificações
      expect(Declaracoes.findOne).toHaveBeenCalledWith({ anoDeclaracao });
      expect(declaracaoMock.arquivistico).toEqual(expect.objectContaining(dadosArquivistico));
      expect(declaracaoMock.save).toHaveBeenCalled();
      expect(resultado).toEqual(declaracaoMock);
    });

    it('deve lançar um erro se a declaração não for encontrada', async () => {
      // Dados de teste
      const anoDeclaracao = '2023';
      const dadosArquivistico = { /* dados de teste */ };

      // Mock para Declaracoes.findOne retornando null
      (Declaracoes.findOne as jest.Mock).mockResolvedValueOnce(null);

      // Chama o método e verifica se lança um erro
      await expect(declaracaoService.atualizarArquivistico(anoDeclaracao, dadosArquivistico)).rejects.toThrowError('Declaração não encontrada para o ano especificado.');
    });

    it('deve lançar um erro se ocorrer um erro ao salvar', async () => {
      // Dados de teste
      const anoDeclaracao = '2023';
      const dadosArquivistico = { /* dados de teste */ };
      const declaracaoMock = {
        _id: 'id-da-declaracao',
        arquivistico: { /* dados existentes de arquivísticos */ },
        save: jest.fn().mockRejectedValueOnce(new Error('Erro ao salvar')),
      };

      // Mock para Declaracoes.findOne
      (Declaracoes.findOne as jest.Mock).mockResolvedValueOnce(declaracaoMock);

      // Chama o método e verifica se lança um erro
      await expect(declaracaoService.atualizarArquivistico(anoDeclaracao, dadosArquivistico)).rejects.toThrowError('Erro ao atualizar dados arquivísticos: Erro ao salvar');
    });
  });
  describe('atualizarBibliografico', () => {
    it('deve atualizar os dados arquivísticos de uma declaração existente', async () => {
      // Dados de teste
      const anoDeclaracao = '2023';
      const dadosBibliografico = { /* dados de teste */ };
      const declaracaoMock = {
        _id: 'id-da-declaracao',
        bibliografico: { /* dados existentes de arquivísticos */ },
        save: jest.fn().mockResolvedValueOnce({ /* nova declaração atualizada */ }),
      };

      // Mock para Declaracoes.findOne
      (Declaracoes.findOne as jest.Mock).mockResolvedValueOnce(declaracaoMock);

      // Chama o método
      const resultado = await declaracaoService.atualizarArquivistico(anoDeclaracao, dadosBibliografico);

      // Verificações
      expect(Declaracoes.findOne).toHaveBeenCalledWith({ anoDeclaracao });
      expect(declaracaoMock.bibliografico).toEqual(expect.objectContaining(dadosBibliografico));
      expect(declaracaoMock.save).toHaveBeenCalled();
      expect(resultado).toEqual(declaracaoMock);
    });

    it('deve lançar um erro se a declaração não for encontrada', async () => {
      // Dados de teste
      const anoDeclaracao = '2023';
      const dadosBibliografico = { /* dados de teste */ };

      // Mock para Declaracoes.findOne retornando null
      (Declaracoes.findOne as jest.Mock).mockResolvedValueOnce(null);

      // Chama o método e verifica se lança um erro
      await expect(declaracaoService.atualizarArquivistico(anoDeclaracao, dadosBibliografico)).rejects.toThrowError('Declaração não encontrada para o ano especificado.');
    });

    it('deve lançar um erro se ocorrer um erro ao salvar', async () => {
      // Dados de teste
      const anoDeclaracao = '2023';
      const dadosBibliografico = { /* dados de teste */ };
      const declaracaoMock = {
        _id: 'id-da-declaracao',
        Bibliografico: { /* dados existentes de arquivísticos */ },
        save: jest.fn().mockRejectedValueOnce(new Error('Erro ao salvar')),
      };

      // Mock para Declaracoes.findOne
      (Declaracoes.findOne as jest.Mock).mockResolvedValueOnce(declaracaoMock);

      // Chama o método e verifica se lança um erro
      await expect(declaracaoService.atualizarArquivistico(anoDeclaracao, dadosBibliografico)).rejects.toThrowError('Erro ao atualizar dados arquivísticos: Erro ao salvar');
    });
  });
  describe('atualizarMuseologico', () => {
    it('deve atualizar os dados museológicos de uma declaração existente', async () => {
      // Dados de teste
      const anoDeclaracao = '2023';
      const dadosMuseologicos = { };
      const declaracaoMock = {
        _id: 'id-da-declaracao',
        museologico: {  },
        save: jest.fn().mockResolvedValueOnce({  }),
      };

      // Mock para Declaracoes.findOne
      (Declaracoes.findOne as jest.Mock).mockResolvedValueOnce(declaracaoMock);

      // Chama o método
      const resultado = await declaracaoService.atualizarArquivistico(anoDeclaracao, dadosMuseologicos);

      // Verificações
      expect(Declaracoes.findOne).toHaveBeenCalledWith({ anoDeclaracao });
      expect(declaracaoMock.museologico).toEqual(expect.objectContaining(dadosMuseologicos));
      expect(declaracaoMock.save).toHaveBeenCalled();
      expect(resultado).toEqual(declaracaoMock);
    });

    it('deve lançar um erro se a declaração não for encontrada', async () => {
      // Dados de teste
      const anoDeclaracao = '2023';
      const dadosMuseologicos = { };

      // Mock para Declaracoes.findOne retornando null
      (Declaracoes.findOne as jest.Mock).mockResolvedValueOnce(null);

      // Chama o método e verifica se lança um erro
      await expect(declaracaoService.atualizarArquivistico(anoDeclaracao, dadosMuseologicos)).rejects.toThrowError('Declaração não encontrada para o ano especificado.');
    });

    it('deve lançar um erro se ocorrer um erro ao salvar', async () => {
      // Dados de teste
      const anoDeclaracao = '2023';
      const dadosMuseologicos = { /* dados de teste */ };
      const declaracaoMock = {
        _id: 'id-da-declaracao',
        Museologico: { /* dados existentes de arquivísticos */ },
        save: jest.fn().mockRejectedValueOnce(new Error('Erro ao salvar')),
      };

      
      (Declaracoes.findOne as jest.Mock).mockResolvedValueOnce(declaracaoMock);

    
      await expect(declaracaoService.atualizarMuseologico(anoDeclaracao, dadosMuseologicos)).rejects.toThrowError('Erro ao atualizar dados arquivísticos: Erro ao salvar');
    });
  });

});

