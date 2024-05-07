# API Rest - INBCM

## Descrição do Projeto

A API REST para o Inventário Nacional de Bens Culturais Musealizados (INBCM) é um sistema desenvolvido em Node.js, TypeScript, MongoDB e RabbitMQ. Essa API permite a submissão de inventários (declarações) dos museus do país, bem como fornece recibos de envio de declaração. O projeto tem como objetivo facilitar o processo de catalogação e gestão de bens culturais musealizados em âmbito naciona

## Backend - Instruções de Configuração e Execução:

1. Certifique-se de ter o Node.js e o MongoDB instalado em sua máquina.
  Para verificar utilize o comando:
```
node -v
npm -v
```
Caso não tenha instalado acesse o site oficial: 
[NodeJS Download](https://nodejs.org/en/download/current)

2. Clone este repositório usando o comando:
```
git clone https://github.com/Nocs-lab/inbcm-backend-upload.git
```
3. Instale as dependências usando o npm:
```
npm install
```
4. Crie um arquivo `.env` na raiz do projeto e adicione a URL de conexão com o MongoDB:
```
DB_USER="root"
DB_PASS="asdf1234"
KEYCLOAK_DB_PASSWORD="asdf1234"
DB_URL="mongodb+srv://ricksonroccha:kkiag6cSXcij3IXY@cluster0.pwhthy0.mongodb.net/INBCM"
#DB_URL="mongodb://${DB_USER}:${DB_PASS}@localhost:27017/INBCM?authSource=admin"
QUEUE_URL="amqp://guest:guest@localhost"

```
5. Inicie o servidor usando o comando:
```
npm run dev
```

# Descrição das funcionalidades



Certifique-se de incluir os parâmetros necessários e observar as restrições definidas para cada operação.

## Testes do Insomnia
Você pode encontrar os testes do Insomnia no arquivo `Insomnia_INBCM.json`. Importe este arquivo para o seu cliente Insomnia para testar os endpoints facilmente.
