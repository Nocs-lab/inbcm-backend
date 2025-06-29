

import { Filtro } from "./FiltroPaginacao"; 

interface FiltrosTraduzidos {
  filtrosMuseu: any;
  filtrosAgregacao: any;
}

export function traduzirFiltrosParaMongo(filtros: Filtro[]): FiltrosTraduzidos {
  const filtrosMuseu: any = {};
  const filtrosAgregacao: any = {};

  filtros.forEach(filtro => {
    const campo = filtro.atributo;

   
    if (campo === "regiao") {
      const isString = filtro.tipo === "string";

    
      if (filtro.operador === "eq") {
        const valor = isString ? filtro.valores[0].toUpperCase() : filtro.valores[0];
       
        filtrosAgregacao['$expr'] = {
          $eq: [{ $toUpper: "$estadoInfo.regiao" }, valor]
        };
      }
      
     
      if (filtro.operador === "in") {
        const valores = isString ? filtro.valores.map(v => v.toUpperCase()) : filtro.valores;
     
        filtrosAgregacao['$expr'] = {
          $in: [{ $toUpper: "$estadoInfo.regiao" }, valores]
        };
      }
      
    

      return;
    }
    
    
   
    const isString = filtro.tipo === "string";
    const valor = filtro.valores[0];

    if (campo.startsWith("camposComErro")) {
      if (filtro.operador === "eq") {
        filtrosMuseu["camposArray.v"] = { $eq: valor };
      }
      return;
    }

    switch (filtro.operador) {
      case "eq":
        filtrosMuseu[campo] = isString ? valor.toUpperCase() : { $eq: valor };
        break;
      case "ne":
        filtrosMuseu[campo] = isString ? { $ne: valor.toUpperCase() } : { $ne: valor };
        break;
      case "in":
        const valoresIn = isString ? filtro.valores.map(v => v.toUpperCase()) : filtro.valores;
        filtrosMuseu[campo] = { $in: valoresIn };
        break;
      case "like":
        filtrosMuseu[campo] = { $regex: valor, $options: "i" };
        break;
      case "gte":
        filtrosMuseu[campo] = { $gte: valor };
        break;
      case "lte":
        filtrosMuseu[campo] = { $lte: valor };
        break;
    }
  });

  return { filtrosMuseu, filtrosAgregacao };
}


export function traduzirOperador(op: string): string {
  switch (op) {
    case "eq": return "$eq";
    case "ne": return "$ne";
    case "in": return "$in";
    case "like": return "$regex";
    case "gte": return "$gte";
    case "lte": return "$lte";
    default:
      throw new Error(`Operador inválido: ${op}`);
  }
}