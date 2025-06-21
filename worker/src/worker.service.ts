import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Pedido } from './order/order.entity';
import { Estatus } from './status/status.entity';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';

@Injectable()
export class WorkerService {
    private readonly logger = new Logger(WorkerService.name);

    constructor(
        @InjectRepository(Pedido)
        private pedidoRepository: Repository<Pedido>,
        @InjectRepository(Estatus)
        private estatusRepository: Repository<Estatus>,
    ) {}

    async handlePedidoCreado(data: { pedidoId: number; initialStatus: string }, context: RmqContext) {
        const channel = context.getChannelRef();
        const originalMessage = context.getMessage();

        const { pedidoId, initialStatus } = data;
        this.logger.log(`[Order Created Event] Worker received event for Pedido ID: ${pedidoId}. Initial Status: ${initialStatus}`);

        // ¡IMPORTANTE! Envía el ACK inmediatamente para que RabbitMQ sepa que el mensaje ha sido procesado.
        // Esto evita que RabbitMQ intente re-enviar el mensaje si tu worker se cae durante el delay.
        channel.ack(originalMessage);

        const delay = 5 * 1000; // 5 segundos para pruebas. Cámbialo a 5 * 60 * 1000 para 5 minutos.

        this.logger.log(`[Order Processing] Setting a ${delay / 1000} second delay for Pedido ID: ${pedidoId}`);

        setTimeout(async () => {
            try {
                const pedido = await this.pedidoRepository.findOne({
                    where: { ID_Pedido: pedidoId },
                    relations: ['estatus']
                });

                if (pedido) {
                    const currentStatusObject = Array.isArray(pedido.estatus)
                        ? pedido.estatus[pedido.estatus.length - 1]
                        : pedido.estatus;

                    const currentStatusName = currentStatusObject ? currentStatusObject.estatus : null;

                    if (currentStatusName === initialStatus || currentStatusName === 'Pendiente') {
                        const newEstatusEnTransito = this.estatusRepository.create({
                            estatus: 'En Tránsito',
                            fecha_hora: new Date(),
                            pedido: pedido
                        });

                        await this.estatusRepository.save(newEstatusEnTransito);

                        this.logger.log(`[Order Updated] Pedido ${pedidoId} successfully updated to "En Tránsito".`);
                    } else {
                        const lastStatus = currentStatusName || 'Unknown';
                        this.logger.warn(`[Order Skipped] Pedido ${pedidoId} status is "${lastStatus}". Skipping update to "En Tránsito".`);
                    }
                } else {
                    this.logger.error(`[Order Not Found] Pedido ${pedidoId} not found for update after delay.`);
                }
            } catch (error) {
                this.logger.error(`[Error Updating Order] Failed to update status for Pedido ${pedidoId}:`, error.stack);
            }
        }, delay);
    }
}