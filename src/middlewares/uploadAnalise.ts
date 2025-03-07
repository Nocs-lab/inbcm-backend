import multer, { MulterError } from "multer"
import { Request, RequestHandler } from "express"
import { uploadFileAnaliseToMinio } from "../utils/minioUtil"
import { Declaracoes } from "../models/Declaracao"

const upload = multer({
  limits: { fileSize: 1024 * 1024 * 1024 }
}).fields([
  { name: "arquivistico", maxCount: 1 },
  { name: "bibliografico", maxCount: 1 },
  { name: "museologico", maxCount: 1 }
])

interface SubmissionRequest extends Request {
  files: {
    arquivistico?: Express.Multer.File[]
    bibliografico?: Express.Multer.File[]
    museologico?: Express.Multer.File[]
  }
}

const uploadAnalise: RequestHandler = async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      const errorMessage =
        err instanceof MulterError
          ? "Erro ao fazer submissão do(s) arquivo(s): " + err.message
          : "Erro não mapeado ao fazer submissão do(s) arquivo(s): " +
            err.message
      return res
        .status(err instanceof MulterError ? 400 : 500)
        .json({ message: errorMessage })
    }

    const uploadReq = req as SubmissionRequest

    const { arquivistico, bibliografico, museologico } = uploadReq.files

    if (!arquivistico && !bibliografico && !museologico) {
      return res
        .status(400)
        .json({ message: "Pelo menos um arquivo deve ser enviado." })
    }

    const { declaracaoId, tipoArquivo } = req.params

    try {
      const declaracao = await Declaracoes.findById(declaracaoId)
      if (!declaracao) {
        return res.status(404).json({
          message: "Declaração não encontrada."
        })
      }

      const { museu_id } = declaracao

      const tiposArquivos = ["museologico", "bibliografico", "arquivistico"]
      if (!tiposArquivos.includes(tipoArquivo)) {
        return res.status(400).json({ message: "Tipo de arquivo inválido." })
      }

      if (arquivistico && arquivistico.length > 0) {
        await uploadFileAnaliseToMinio(
          arquivistico[0],
          museu_id.toString(),
          "arquivistico"
        )
      }

      if (bibliografico && bibliografico.length > 0) {
        await uploadFileAnaliseToMinio(
          bibliografico[0],
          museu_id.toString(),
          "bibliografico"
        )
      }

      if (museologico && museologico.length > 0) {
        await uploadFileAnaliseToMinio(
          museologico[0],
          museu_id.toString(),
          "museologico"
        )
      }

      next()
    } catch (uploadError) {
      return res.status(500).json({
        message: "Erro ao fazer upload para MinIO",
        error: uploadError
      })
    }
  })
}

export default uploadAnalise
