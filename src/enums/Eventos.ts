export enum Eventos {
  EnvioDeclaracao = "Envio de declaração",
  RetificacaoDeclaracao = "Retificação de declaração",
  EnvioParaAnalise = "Declaração enviada para análise",
  ConclusaoAnalise = "Conclusão de análise", //verificar se é realmente utilizado
  MudancaStatus = "Alteração de situação",
  ExclusaoDeclaracao = "Exclusão de declaração",
  DeclaracaoRestaurada = `Declaração restaurada para situação "Recebida"`,
  FinalizacaoAnalise = "Alteração de situação após análise",
  MudancaDeAnalista = "Mudança de analista"
}
