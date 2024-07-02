import swaggerJSDoc from 'swagger-jsdoc';
import yaml from 'yaml';
import { writeFileSync } from 'fs';

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
    security: [
      {},
      {
        basicAuth: [],
      },
    ],
  },
  apis: ['routes/*.ts'], // Especifique o caminho para seus arquivos de rota

}
const swaggerSpec = swaggerJSDoc(options);

writeFileSync('openapi.yaml', yaml.stringify(swaggerSpec))

export default swaggerSpec;
