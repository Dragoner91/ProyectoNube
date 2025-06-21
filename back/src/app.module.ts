import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { Pedido } from './order/order.entity';
import { Estatus } from './status/status.entity';
import { Cliente } from './client/client.entity';
import { Producto } from './product/product.entity';
import { ProductoPedido } from './order/order_product.entity';
import { PedidoController } from './order/order.controller';
import { PedidoService } from './order/order.service';
import { ClienteController } from './client/client.controller';
import { ProductoController } from './product/product.controller';
import { ClienteService } from './client/client.service';
import { ProductoService } from './product/product.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'db'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USER', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'postgres'),
        entities: [Pedido, Estatus, Cliente, Producto, ProductoPedido], 
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
    TypeOrmModule.forFeature([Pedido, Estatus, Cliente, Producto, ProductoPedido]),
    ClientsModule.registerAsync([
      {
        name: 'RABBITMQ_SERVICE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>('RABBITMQ_URL', 'amqp://rabbitmq')],
            queue: 'order_created_queue',
            queueOptions: {
              durable: false,
            },
          },
        }),
      },
    ]),
  ],
  controllers: [PedidoController, ClienteController, ProductoController],
  providers: [PedidoService, ClienteService, ProductoService],
})
export class AppModule {}
