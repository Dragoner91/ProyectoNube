import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WorkerModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    WorkerModule, // Tu módulo principal del worker
    {
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://rabbitmq'], // La URL de tu RabbitMQ
        queue: 'order_status_queue', // La cola a la que este worker escuchará
        queueOptions: {
          durable: false // Puedes cambiarlo a true si quieres que la cola persista al reiniciar RabbitMQ
        },
      },
    },
  );
  await app.listen();
  console.log('Worker Microservice is listening...');
}
bootstrap();
