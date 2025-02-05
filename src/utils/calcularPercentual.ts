export function calcularPercentuais(
  arquivoData: { [key: string]: string }[],
  requiredFields: string[]
): {
  porcentagemGeral: number
  porcentagemPorCampo: Record<string, number>
  errors: string[]
} {
  const totalCampos = Object.keys(arquivoData[0] || {}).length // Total de campos por linha
  const totalLinhas = arquivoData.length // Total de linhas
  const totalCamposEsperados = totalCampos * totalLinhas // Total de campos no arquivo

  let camposPreenchidos = 0 // Contador de campos preenchidos
  const fieldCounts: Record<string, number> = {} // Contador de preenchimento por campo
  const errors: string[] = [] // Campos obrigatórios não preenchidos

  // Inicializa o contador de campos
  Object.keys(arquivoData[0] || {}).forEach((campo) => {
    fieldCounts[campo] = 0
  })

  // Itera sobre cada linha
  arquivoData.forEach((linha) => {
    Object.entries(linha).forEach(([campo, valor]) => {
      if (valor) {
        camposPreenchidos++
        fieldCounts[campo]++
      }
    })

    // Verifica campos obrigatórios
    requiredFields.forEach((campo) => {
      if (!linha[campo]) {
        errors.push(campo)
      }
    })
  })

  // Calcula o percentual de preenchimento por campo
  const porcentagemPorCampo: Record<string, number> = {}
  Object.entries(fieldCounts).forEach(([campo, count]) => {
    porcentagemPorCampo[campo] = (count / totalLinhas) * 100
  })

  // Calcula o percentual de preenchimento geral
  const porcentagemGeral =
    totalCamposEsperados > 0
      ? (camposPreenchidos / totalCamposEsperados) * 100
      : 0

  return {
    porcentagemGeral,
    porcentagemPorCampo,
    errors: Array.from(new Set(errors)) // Remove duplicatas
  }
}
