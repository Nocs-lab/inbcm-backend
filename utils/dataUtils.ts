export function gerarDataFormatada(data:Date):String{
 return data.toLocaleDateString('pt-BR');
}

export function gerarHoraFormatada(data:Date):String{
  return data.toLocaleTimeString('pt-BR')
}