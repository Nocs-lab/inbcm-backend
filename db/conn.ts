import mongoose from "mongoose";

async function main() {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(
      `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@localhost`,
    );
    console.log("Conectado ao MongoDB!");
  } catch (error) {
    console.log(`Erro: ${error}`);
  }
}

// Exporte a função `main` como exportação padrão
export default main;
