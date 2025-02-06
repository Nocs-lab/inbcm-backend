export function calcularPercentuais(
  arquivoData: { [key: string]: string }[],
  requiredFields: string[]
): {
  porcentagemGeral: number
  porcentagemPorCampo: { campo: string; percentual: number }[]
  errors: string[]
} {
  const totalCampos = Object.keys(arquivoData[0] || {}).length
  const totalLinhas = arquivoData.length
  const totalCamposEsperados = totalCampos * totalLinhas

  let camposPreenchidos = 0
  const fieldCounts: Record<string, number> = {}
  const errors: string[] = []

  Object.keys(arquivoData[0] || {}).forEach((campo) => {
    fieldCounts[campo] = 0
  })

  arquivoData.forEach((linha) => {
    Object.entries(linha).forEach(([campo, valor]) => {
      if (valor) {
        camposPreenchidos++
        fieldCounts[campo]++
      }
    })

    requiredFields.forEach((campo) => {
      if (!linha[campo]) {
        errors.push(campo)
      }
    })
  })

  // Calcula o percentual de preenchimento por campo e converte em array
  const porcentagemPorCampo: { campo: string; percentual: number }[] =
    Object.entries(fieldCounts).map(([campo, count]) => ({
      campo,
      percentual: (count / totalLinhas) * 100
    }))

  // Calcula o percentual de preenchimento geral
  const porcentagemGeral =
    totalCamposEsperados > 0
      ? (camposPreenchidos / totalCamposEsperados) * 100
      : 0

  return {
    porcentagemGeral,
    porcentagemPorCampo,
    errors: Array.from(new Set(errors))
  }
}
