import { fakerPT_BR } from "@faker-js/faker"
import { Museu, Usuario } from "../models"
import { hash } from "@node-rs/argon2"
import connect from "../db/conn"

;(async () => {
  await connect()

  const senha = await hash("1234")

  const users = await Usuario.insertMany(
    Array.from({ length: 2 }, () => {
      const nome = fakerPT_BR.person.fullName()
      const [firstName, lastName] = nome.split(" ")

      return {
        nome,
        email: fakerPT_BR.internet.email({ firstName, lastName }),
        senha,
        admin: false,
        museus: []
      }
    })
  )

  await Museu.insertMany(
    Array.from({ length: 4 }).map((_, index) => ({
      nome: `Museu Prof(a). ${fakerPT_BR.person.fullName()}`,
      endereco: {
        municipio: fakerPT_BR.location.city(),
        rua: fakerPT_BR.location.street(),
        UF: fakerPT_BR.location.state(),
        logradouro: fakerPT_BR.location.street(),
        numero: fakerPT_BR.location.buildingNumber(),
        complemento: fakerPT_BR.location.secondaryAddress(),
        bairro: fakerPT_BR.location.city(),
        cep: fakerPT_BR.location.zipCode(),
        uf: fakerPT_BR.location.state({ abbreviated: true })
      },
      esferaAdministraiva: "Privado",
      codIbram: index + 1,
      usuario: users[index % 2]._id
    }))
  )

  process.exit(0)
})()
