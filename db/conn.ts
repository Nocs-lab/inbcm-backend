import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function main() {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(
      process.env.DB_URL!,
    );
    console.log("Conectado ao MongoDB!");
  } catch (error) {
    console.log(`Erro: ${error}`);
  }
}

// Exporte a função `main` como exportação padrão
export default main;
