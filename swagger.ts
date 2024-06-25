import swaggerJSDoc from 'swagger-jsdoc';

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

}
const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
