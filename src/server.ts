import "./config"
import app from "./app"
import conn from "./db/conn"

conn()

const PORT = parseInt(process.env.PORT || "3000")

app.listen(PORT, () => console.log(`Servidor funcionando na porta ${PORT}`))
