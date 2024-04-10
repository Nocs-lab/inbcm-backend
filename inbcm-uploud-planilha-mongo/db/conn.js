const mongoose = require("mongoose")

async function main(){


    try {
        mongoose.set("strictQuery",true)
        await mongoose.connect('mongodb+srv://ricksonroccha:kkiag6cSXcij3IXY@cluster0.pwhthy0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
        console.log('conectado ao banco!')
    } catch (error) {
        console.log(`Erro : ${error}`)
    }
}
module.exports = main