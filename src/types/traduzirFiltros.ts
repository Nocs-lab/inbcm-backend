import { Filtro } from "./FiltroPaginacao"

export function traduzirFiltrosParaMongo(filtros: Filtro[]): any {
  const mongoFiltros: any = {}

  filtros.forEach(filtro => {
    // Caso especial: buscar por valores dentro de camposComErro (camposArray.v)
    if (filtro.atributo.startsWith("camposComErro")) {
      const valor = filtro.valores[0]

      if (filtro.operador === "eq") {
        // Procurar qualquer campo que tenha esse valor
        mongoFiltros["camposArray.v"] = { $eq: valor }
      }

      // Exemplo: se quiser filtrar campo específico (ex: camposComErro.situacao = "X")
      // pode usar camposArray.k e camposArray.v em combinação com $elemMatch
      // Exemplo:
      // mongoFiltros["camposArray"] = { $elemMatch: { k: "situacao", v: valor } }
    } else {
      // Filtros normais
      const campo = filtro.atributo
      const valor = filtro.valores[0]

      switch (filtro.operador) {
        case "eq":
          mongoFiltros[campo] = { $eq: valor }
          break
        case "ne":
          mongoFiltros[campo] = { $ne: valor }
          break
        case "in":
          mongoFiltros[campo] = { $in: filtro.valores }
          break
       
      }
    }
  })

  return mongoFiltros
}


export function traduzirOperador(op: string): string {
  switch (op) {
    case "eq": return "$eq"
    case "ne": return "$ne"
    case "in": return "$in"
    case "like": return "$regex"
    case "gte": return "$gte"
    case "lte": return "$lte"
    default:
      throw new Error(`Operador inválido: ${op}`)
  }
}