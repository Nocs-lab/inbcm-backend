import { SituacaoUsuario } from "../Usuario"

export class UpdateUserDto {
  nome?: string
  email?: string
  perfil?: string
  especialidadeAnalista?: string[]
  museus?: string[]
  desvincularMuseus?: string[]
  cpf?: string
  situacao?: SituacaoUsuario
}
