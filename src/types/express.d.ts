// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Request } from "express"
import { IUsuario } from "../models"

declare global {
  namespace Express {
    interface Request {
      user: IUsuario
    }
  }
}

interface IRequestUser {
  id: string
  admin: boolean
  profile: IProfile | Types.ObjectId | string
}

declare global {
  namespace Express {
    interface Request {
      user?: IRequestUser
    }
  }
}
