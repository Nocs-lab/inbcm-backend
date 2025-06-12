import { Filtro } from "./FiltroPaginacao"

export function traduzirFiltrosParaMongo(filtros: Filtro[]): any {
  const mongoFiltros: any = {}

  filtros.forEach(filtro => {
    const campo = filtro.atributo
    const valor = filtro.valores[0]
    const isString = filtro.tipo === "string"

    // Caso especial: camposComErro
    if (campo.startsWith("camposComErro")) {
      if (filtro.operador === "eq") {
        mongoFiltros["camposArray.v"] = { $eq: valor }
      }
      return
    }

    switch (filtro.operador) {
      case "eq":
        if (isString) {
          mongoFiltros[campo] = valor.toUpperCase()
        } else {
          mongoFiltros[campo] = { $eq: valor }
        }
        break

      case "ne":
        if (isString) {
          mongoFiltros[campo] = { $ne: valor.toUpperCase() }
        } else {
          mongoFiltros[campo] = { $ne: valor }
        }
        break

      case "in":
        if (isString) {
          mongoFiltros[campo] = {
            $in: filtro.valores.map(v => v.toUpperCase())
          }
        } else {
          mongoFiltros[campo] = { $in: filtro.valores }
        }
        break

      case "like":
        mongoFiltros[campo] = { $regex: valor, $options: "i" }
        break

      case "gte":
        mongoFiltros[campo] = { $gte: valor }
        break

      case "lte":
        mongoFiltros[campo] = { $lte: valor }
        break
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