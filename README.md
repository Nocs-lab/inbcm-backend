## BACKEND - INBCM

# API REST para o Inventário Nacional de Bens Culturais Musealizados (INBCM)

## Descrição do Projeto

A API REST para o Inventário Nacional de Bens Culturais Musealizados (INBCM) é parte do sistema que visa construir a plataforma do Inventário Nacional de Bens Culturais Musealizados, uma iniciativa que busca catalogar, documentar e preservar o patrimônio cultural do Brasil. Este repositório contém o backend da plataforma, responsável por fornecer os serviços necessários para gerenciar e acessar as informações sobre os bens culturais musealizados em todo o país.

A plataforma do INBCM tem como objetivo principal centralizar e facilitar o acesso às informações sobre os bens culturais musealizados, permitindo que instituições, pesquisadores e o público em geral possam consultar e contribuir para a preservação desse importante patrimônio cultural.

## Funcionalidades Principais

- **Submissão de Declarações de Inventário**: Os museus e instituições culturais podem submeter declarações de inventário contendo informações detalhadas sobre os bens culturais que possuem.
  
- **Recebimento de Recibos de Envio de Declaração**: Após a submissão de uma declaração de inventário, os usuários recebem um recibo de envio que confirma a submissão bem-sucedida.

- **Consulta de Declarações Anuais**: A plataforma permite a consulta de declarações anuais dos museus, facilitando a análise e a geração de relatórios sobre o estado e a diversidade do patrimônio cultural musealizado em diferentes regiões do país.

## Tecnologias Utilizadas

- **Node.js e Express.js**: Para construir a infraestrutura da API REST.
  
- **TypeScript**: Para adicionar tipagem estática ao JavaScript, tornando o código mais robusto e legível.
  
- **MongoDB**: Como banco de dados NoSQL para armazenar os dados sobre os bens culturais e as declarações de inventário.

- **RabbitMQ**: Para a implementação de mensageria assíncrona e processamento de tarefas em segundo plano.

# Instalação das Ferramentas em Ambientes Windows e Linux

Este guia fornece instruções sobre como instalar as ferramentas necessárias para executar a API REST para o Inventário Nacional de Bens Culturais Musealizados (INBCM) em ambientes Windows e Linux. As ferramentas incluem Node.js, npm, MongoDB e RabbitMQ.

## Ambiente Windows

### Node.js e npm

1. Baixe o instalador do Node.js do [site oficial](https://nodejs.org/) e execute o instalador.
2. Siga as instruções do instalador para completar a instalação.
3. Após a instalação, abra o Prompt de Comando (CMD) e execute os seguintes comandos para verificar se o Node.js e o npm foram instalados corretamente:

    ```bash
    node -v
    npm -v
    ```

### RabbitMQ

1. Baixe o instalador do RabbitMQ do [site oficial](https://www.rabbitmq.com/) e execute o instalador.
2. Siga as instruções do instalador para completar a instalação.
3. Após a instalação, o RabbitMQ será iniciado automaticamente como um serviço do Windows.

## Ambiente Linux

### Node.js e npm

1. Instale o Node.js e o npm usando o gerenciador de pacotes do seu sistema. Por exemplo, no Ubuntu, você pode usar o apt:

    ```bash
    sudo apt update
    sudo apt install nodejs npm
    ```

2. Após a instalação, verifique se o Node.js e o npm foram instalados corretamente executando os seguintes comandos:

    ```bash
    node -v
    npm -v
    ```


2. Após a instalação, inicie o serviço do MongoDB:

    ```bash
    sudo service mongodb start
    ```

### RabbitMQ

1. Instale o RabbitMQ usando o gerenciador de pacotes do seu sistema. Por exemplo, no Ubuntu, você pode usar o apt:

    ```bash
    sudo apt update
    sudo apt install rabbitmq-server
    ```

2. Após a instalação, o RabbitMQ será iniciado automaticamente como um serviço do sistema.


# Executando a API

Depois de instalar todas as ferramentas necessárias, você está pronto para executar a API do Inventário Nacional de Bens Culturais Musealizados (INBCM). Siga as etapas abaixo para iniciar o servidor e começar a usar a API:

## 1. Clonando o Repositório

Clone o repositório do projeto para o seu ambiente de desenvolvimento. Você pode fazer isso usando o Git com o seguinte comando:

```bash
  git clone  https://github.com/Nocs-lab/inbcm-backend-upload.git
```

## 2.  Instalando as Dependências
Navegue até o diretório do projeto clonado e instale todas as dependências do Node.js usando o npm. Isso pode ser feito com o seguinte comando:

```bash
cd inbcm-backend
npm install
```

## 3.Configurando o Arquivo .env

Após instalar as depências do projeto,crie um arquivo .env
```
DB_URL=mongodb+srv://ricksonroccha:kkiag6cSXcij3IXY@cluster0.pwhthy0.mongodb.net/INBCM

```

# 4. Instalando typscript

```bash

npm install -g typescript

```

# Iniciando os serviços:

```bash

npm run dev 

```
