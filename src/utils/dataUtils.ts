import { formatInTimeZone } from "date-fns-tz"
import { addHours } from "date-fns";

export class DataUtils {
  static getCurrentData() {
    return new Date()
  }
  static gerarDataFormatada(data: Date = this.getCurrentData()): string {
    const timeZone = "America/Sao_Paulo"
    return formatInTimeZone(data, timeZone, "dd/MM/yyyy")
  }

  static gerarHoraFormatada(data: Date = this.getCurrentData()): string {
    const timeZone = "America/Sao_Paulo"
    return formatInTimeZone(data, timeZone, "HH:mm:ss")
  }

  static gerarDataHoraFormatada(data: Date = this.getCurrentData()): string {
    // Configurar timeZone com UTC para compatibilizar com o servidor
    const timeZone = "UTC"
    // Adiciona 3 horas para configurar com o horário de São Paulo
    const dataAjustada = addHours(data, 3);
    // Formatar a data e a hora juntas no formato ISO
    return formatInTimeZone(dataAjustada, timeZone, "yyyy-MM-dd'T'HH:mm:ss")
  }

  static gerarDataHoraExtenso(data: Date = this.getCurrentData()): string {
    return new Intl.DateTimeFormat("pt-BR", {
      // weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric"
    })
      .format(data)
      .replace(/^\w/, (c) => c.toUpperCase());
  }
}
