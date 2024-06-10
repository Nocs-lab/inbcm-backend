import { Usuario } from "../models";
import connect from "../db/conn";

const listUsers = async () => {
  await connect()

  const users = await Usuario.find()

  console.log(users)
}

listUsers().then(() => {
  console.log('Usuários listados com sucesso!');
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
