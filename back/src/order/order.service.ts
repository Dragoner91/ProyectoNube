import { Injectable, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Pedido } from './order.entity';
import { Estatus } from 'src/status/status.entity';
import { Cliente } from 'src/client/client.entity';
import { Producto } from 'src/product/product.entity';
import { ProductoPedido } from './order_product.entity';
import { ClientProxy } from '@nestjs/microservices';
import { CreatePedidoDto } from './create-order.dto';

@Injectable()
export class PedidoService {
    constructor(
        @InjectRepository(Pedido)
        private pedidoRepository: Repository<Pedido>,
        @InjectRepository(Estatus)
        private estatusRepository: Repository<Estatus>,
        @InjectRepository(Cliente)
        private clienteRepository: Repository<Cliente>,
        @InjectRepository(Producto)
        private productoRepository: Repository<Producto>,
        @InjectRepository(ProductoPedido)
        private productoPedidoRepository: Repository<ProductoPedido>,
        @Inject('RABBITMQ_SERVICE') private readonly rabbitMQService: ClientProxy,
    ) {}

    async createPedido(createPedidoDto: CreatePedidoDto): Promise<Pedido> {
        const { ID_Cliente, productos, ...pedidoData } = createPedidoDto;

        // 1. Validar cliente
        const cliente = await this.clienteRepository.findOne({ where: { ID_Cliente } });
        if (!cliente) {
            throw new NotFoundException(`Cliente con ID ${ID_Cliente} no encontrado.`);
        }

        // 2. Crear el pedido base (sin estatus ni productos-pedido aún)
        // Guardamos el pedido primero para obtener su ID_Pedido
        // Esto es crucial para las relaciones ManyToOne en ProductoPedido y Estatus
        const newPedido = this.pedidoRepository.create({
            ...pedidoData,
            cliente: cliente,
            // No inicializamos estatus ni productosPedidos aquí para que TypeORM no los rastree inmediatamente
            // y los insertemos manualmente después.
        });

        // Guardamos el pedido base para obtener su ID.
        // Esto permite que las entidades relacionadas (ProductoPedido, Estatus) tengan un ID_Pedido válido para referenciar.
        const savedPedidoBase = await this.pedidoRepository.save(newPedido);

        // 3. Validar productos y construir entidades ProductoPedido
        let productosPedidosEntities: ProductoPedido[] = [];
        if (productos && productos.length > 0) {
            for (const item of productos) {
                const producto = await this.productoRepository.findOne({ where: { ID_Producto: item.ID_Producto } });
                if (!producto) {
                    throw new BadRequestException(`Producto con ID ${item.ID_Producto} no encontrado.`);
                }
                if (producto.disponibilidad === false) {
                    throw new BadRequestException(`Producto con ID ${item.ID_Producto} no está disponible.`);
                }
                if (item.cantidad <= 0) {
                    throw new BadRequestException(`Cantidad inválida para el producto con ID ${item.ID_Producto}. Debe ser mayor que 0.`);
                }
                const productoPedido = this.productoPedidoRepository.create({
                    producto: producto,
                    cantidad: item.cantidad,
                    // ¡Importante!: Asignamos el pedido ya guardado (con ID)
                    pedido: savedPedidoBase,
                });
                productosPedidosEntities.push(productoPedido);
            }
        }

        // 4. Guardar los ProductoPedido explícitamente
        // TypeORM los insertará con el ID_Pedido correcto.
        await this.productoPedidoRepository.save(productosPedidosEntities);

        // 5. Crear el estatus "Pendiente" y ASOCIARLO al pedido ya guardado
        const estatusPendiente = this.estatusRepository.create({
            estatus: 'Pendiente',
            fecha_hora: new Date(),
            // ¡Importante!: Asignamos el pedido ya guardado (con ID)
            pedido: savedPedidoBase,
        });

        // 6. Guardar el estatus "Pendiente" explícitamente
        await this.estatusRepository.save(estatusPendiente);

        // 7. Opcional pero recomendado: Cargar el pedido con sus relaciones para el retorno
        // Esto es necesario porque savedPedidoBase no tiene los arrays 'estatus' ni 'productosPedidos' populados
        const completePedido = await this.pedidoRepository.findOne({
            where: { ID_Pedido: savedPedidoBase.ID_Pedido },
            relations: ['estatus', 'productosPedidos', 'productosPedidos.producto'],
            order: { estatus: { fecha_hora: 'ASC' } }
        });

        if (!completePedido) {
            throw new NotFoundException(`Error al recuperar el pedido completo con ID ${savedPedidoBase.ID_Pedido}`);
        }

        // 8. Publicar evento en RabbitMQ
        this.rabbitMQService.emit('pedido_creado', { pedidoId: completePedido.ID_Pedido, initialStatus: 'Pendiente' })
            .toPromise()
            .catch(err => {
                console.error('Error enviando evento a RabbitMQ:', err);
            });
        console.log(`Pedido ${completePedido.ID_Pedido} creado con estatus "Pendiente" y enviado a RabbitMQ.`);

        return completePedido;
    }

    async findOnePedido(id: number): Promise<Pedido> {
        const pedido = await this.pedidoRepository.findOne({
            where: { ID_Pedido: id },
            relations: ['estatus', 'cliente', 'productosPedidos', 'productosPedidos.producto'],
            order: { estatus: { fecha_hora: 'ASC' } }
        });
        if (!pedido) {
            throw new NotFoundException(`Pedido con ID ${id} no encontrado.`);
        }
        return pedido;
    }

    async findAllPedidos(): Promise<Pedido[]> {
        return this.pedidoRepository.find({
            relations: ['estatus', 'cliente', 'productosPedidos', 'productosPedidos.producto'],
            order: {
                ID_Pedido: 'DESC',
                estatus: { fecha_hora: 'ASC' }
            }
        });
    }
}