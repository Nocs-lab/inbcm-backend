const mongoose = require("mongoose")

async function main(){


    try {
        mongoose.set("strictQuery",true)
        await mongoose.connect('mongodb+srv://admin:admin@cluster0.6f3i2ax.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0')
        console.log('conectado ao banco!')
    } catch (error) {
        console.log(`Erro : ${error}`)
    }
}
module.exports = main