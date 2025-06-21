// worker/src/main.ts
import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WorkerModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WorkerModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@rabbitmq:5672'],
        queue: 'order_created_queue', // La cola correcta del worker
        queueOptions: {
          durable: true
        },
        noAck: false,
        exchange: 'pedido_events_exchange', // El worker declara este exchange
        exchangeType: 'topic',
      },
    },
  );
  await app.listen();
  console.log('Worker Microservice is listening...');
}
bootstrap();