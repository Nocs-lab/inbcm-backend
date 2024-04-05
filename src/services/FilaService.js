import amqp from 'amqplib';

class FilaService {
    constructor(url = 'amqp://localhost:5672') {
        this.url = url;
        this.connection = null;
        this.channel = null;
    }

    async conectar() {
        try {
            this.connection = await amqp.connect(this.url);
            this.channel = await this.connection.createChannel();
            console.log('Conexão com RabbitMQ estabelecida com sucesso.');
        } catch (error) {
            console.error('Erro ao conectar com RabbitMQ:', error);
            throw error;
        }
    }

    async enviarMensagem(queue, mensagem) {
        try {
            await this.channel.assertQueue(queue, { durable: false });
            await this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(mensagem)));
            console.log('Mensagem enviada com sucesso para a fila:', queue);
        } catch (error) {
            console.error('Erro ao enviar mensagem para a fila:', error);
            throw error;
        }
    }

    async receberMensagem(queue, callback) {
        try {
            await this.channel.assertQueue(queue, { durable: false });
            console.log(" [*] Esperando mensagens na fila %s. Pressione CTRL+C para sair", queue);
            this.channel.consume(queue, (msg) => {
                if (msg !== null) {
                    callback(msg.content.toString());
                    this.channel.ack(msg);
                }
            });
        } catch (error) {
            console.error('Erro ao receber mensagem da fila:', error);
            throw error;
        }
    }

    async fecharConexao() {
        try {
            await this.channel.close();
            await this.connection.close();
            console.log('Conexão com RabbitMQ fechada com sucesso.');
        } catch (error) {
            console.error('Erro ao fechar conexão com RabbitMQ:', error);
            throw error;
        }
    }
}

export default FilaService;
