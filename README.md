# Upload de Planilhas

Este um protótipo do INBCM (Inventário Nacional dos Bens Culturais Musealizados).

## Backend - Instruções de Configuração e Execução:

  Para verificar utilize o comando:
```
node -v
npm -v
```
Caso não tenha instalado acesse o site oficial: 
[NodeJS Download](https://nodejs.org/en/download/current)

2. Clone este repositório usando o comando:
```
https://github.com/Nocs-lab/inbcm-backend-upload.git
```
3. Instale as dependências acessando o diretório `Backend` e usando o npm:
```
npm install
```
4. Crie um arquivo `.env` na raiz do projeto e adicione os dados do banco para conectar com o Sequelize:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_DATABASE=inbcm_teste
```
5. Inicie o servidor usando o comando:
```
npm start
```

