import { formatInTimeZone } from "date-fns-tz"

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
    const timeZone = "America/Sao_Paulo"
    // Formatar a data e a hora juntas no formato ISO
    return formatInTimeZone(data, timeZone, "yyyy-MM-dd'T'HH:mm:ss")
  }
}
