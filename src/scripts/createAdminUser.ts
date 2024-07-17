import { hash } from "@node-rs/argon2"
import { Usuario } from "../models/Usuario"
import connect from "../db/conn"

const [email, nome, senha] = process.argv.slice(2)

const createAdminUser = async () => {
  await connect()

  const adminUser = new Usuario({
    email,
    senha: await hash(senha),
    admin: true,
    nome,
    museus: []
  })

  await adminUser.save()
}

createAdminUser()
  .then(() => {
    console.log("Usuário criado com sucesso!")
    process.exit(0)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
