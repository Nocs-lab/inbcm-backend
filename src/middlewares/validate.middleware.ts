import { Request, Response, NextFunction } from "express"
import { ZodSchema, ZodError } from "zod"

export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = (result.error as ZodError).errors.map((e) => ({
        campo: e.path.join("."),
        mensagem: e.message
      }))
      return res.status(422).json({ message: "Dados inválidos.", errors })
    }
    req.body = result.data
    return next()
  }
}
