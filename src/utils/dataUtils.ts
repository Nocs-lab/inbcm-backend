export function gerarDataFormatada(data: Date): string {
  return data.toLocaleDateString("pt-BR")
}

export function gerarHoraFormatada(data: Date): string {
  return data.toLocaleTimeString("pt-BR")
}
