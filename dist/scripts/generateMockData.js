"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const faker_1 = require("@faker-js/faker");
const models_1 = require("../models");
const argon2_1 = require("@node-rs/argon2");
const conn_1 = __importDefault(require("../db/conn"));
function gerarCodIbram() {
    const min = 100000;
    const max = 999999;
    const randomId = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomId.toString();
}
;
(async () => {
    await (0, conn_1.default)();
    const senha = await (0, argon2_1.hash)("1234");
    const users = await models_1.Usuario.insertMany(Array.from({ length: 2 }, () => {
        const nome = faker_1.fakerPT_BR.person.fullName();
        const [firstName, lastName] = nome.split(" ");
        return {
            nome,
            email: faker_1.fakerPT_BR.internet.email({ firstName, lastName }),
            senha,
            admin: false,
            museus: []
        };
    }));
    await models_1.Museu.insertMany(Array.from({ length: 4 }).map((_, index) => ({
        nome: `Museu Prof(a). ${faker_1.fakerPT_BR.person.fullName()}`,
        endereco: {
            municipio: faker_1.fakerPT_BR.location.city(),
            rua: faker_1.fakerPT_BR.location.street(),
            UF: faker_1.fakerPT_BR.location.state(),
            logradouro: faker_1.fakerPT_BR.location.street(),
            numero: faker_1.fakerPT_BR.location.buildingNumber(),
            complemento: faker_1.fakerPT_BR.location.secondaryAddress(),
            bairro: faker_1.fakerPT_BR.location.city(),
            cep: faker_1.fakerPT_BR.location.zipCode(),
            uf: faker_1.fakerPT_BR.location.state({ abbreviated: true })
        },
        esferaAdministraiva: "Privado",
        codIbram: gerarCodIbram(),
        usuario: users[index % 2]._id
    })));
    process.exit(0);
})();
