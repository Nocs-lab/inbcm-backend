"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const options = {
    definition: {
        openapi: '3.1.0',
        info: {
            title: 'API INBCM',
            description: '',
            contact: {
                name: 'Support',
                email: 'nocsinbcmdev@gmail.com',
            },
            version: '1.0.0',
        },
        components: {
            securitySchemes: {
                basicAuth: {
                    type: 'http',
                    scheme: 'basic',
                },
            },
        },
    },
    apis: ['routes/*.ts'], // Especifique o caminho para seus arquivos de rota
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
exports.default = swaggerSpec;
