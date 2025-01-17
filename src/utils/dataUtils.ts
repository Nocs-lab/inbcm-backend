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
}
