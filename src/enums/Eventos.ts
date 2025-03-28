export enum Eventos {
  EnvioDeclaracao = "Envio de declaração",
  EnvioRetificacao = "Envio de retificação",
  EnvioParaAnalise = "Declaração enviada para análise para  o(a) analista ",
  EnvioParaAnalista = "Declaração enviada analista",
  ConclusaoAnalise = "Conclusão de análise",
  MudancaStatus = "Mudança de status de declaração",
  RetificacaoDeclaracao = "Retificação de declaração",
  ExclusaoDeclaracao = "Exclusão de declaração",
  DeclaracaoRestaurada = "Declaração restaurada para situação Recebida"
}
export function getEnumKeyByValue<T extends Record<string, string>>(
  enumObj: T,
  value: string
): keyof T | undefined {
  return (Object.keys(enumObj) as Array<keyof T>).find(
    (key) => enumObj[key] === value
  );
}