import express from "express"
import { Request, Response, NextFunction } from "express"
import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import argon2 from "@node-rs/argon2"
import jwt from "jsonwebtoken"
import { Museu, IMuseu } from "../models/Museu"
import { Usuario, IUsuario } from "../models/Usuario"
import { DeclaracaoModel, Declaracoes } from "../models"
import uploadMiddleware from "../middlewares/UploadMiddleware"
import DeclaracaoController from "../controllers/DeclaracaoController"
import config from "../config"

const app = express()
app.use(express.json())

let mongoServer: MongoMemoryServer
let mongoUri: string
let userMock: IUsuario
let museuMock: IMuseu
let declaracaoMock: DeclaracaoModel

const setupTestEnvironment = async () => {
  mongoServer = await MongoMemoryServer.create()
  mongoUri = mongoServer.getUri()
  await mongoose.connect(mongoUri)

  // Criando  usuário mockado
  const senhaHash = await argon2.hash("senhaSegura")
  userMock = await Usuario.create({
    nome: "Usuário Teste",
    email: "usuario@teste.com",
    senha: senhaHash,
    profile: new mongoose.Types.ObjectId(),
    admin: false,
    ativo: true
  })

  // Criando museu mocjado
  museuMock = await Museu.create({
    codIbram: "66b201c52f84b3f8b048f7a5",
    nome: "Museu Camara Cascudo",
    esferaAdministraiva: "Estadual",
    endereco: {
      logradouro: "Rua Hermes da Fonseca",
      numero: "1398",
      bairro: "Tirol",
      cep: "59020-650",
      municipio: "Natal",
      uf: "RN"
    },
    usuario: userMock._id
  })

}

// Middleware de autenticação mockada, utilizando JWT
const mockAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = jwt.sign(
    { sub: (userMock._id as unknown as mongoose.Types.ObjectId).toString(), admin: userMock.admin },
    config.JWT_SECRET!,
    { expiresIn: "1h" }
  )
  req.headers.authorization = `Bearer ${token}`
  req.user = { id: (userMock._id as unknown as mongoose.Types.ObjectId).toString(), admin: userMock.admin }

  next()
}

// Declarando as rotas e o controller com o middleware de autenticação mockada
const declaracaoController = new DeclaracaoController()

app.post(
  "/public/declaracoes/uploads/:museu/:anoDeclaracao",
  mockAuthMiddleware,
  uploadMiddleware,
  declaracaoController.uploadDeclaracao
)

app.put(
  "/public/declaracoes/retificar/:museu/:anoDeclaracao/:idDeclaracao",
  mockAuthMiddleware,
  uploadMiddleware,
  declaracaoController.retificarDeclaracao.bind(declaracaoController)
)

app.get(
  "/public/declaracoes/:id",
  declaracaoController.getDeclaracao
)

const teardownTestEnvironment = async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
}

export {
  app,
  setupTestEnvironment,
  teardownTestEnvironment,
  museuMock,
  declaracaoMock,
  userMock
}
