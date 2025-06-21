import { Injectable, Logger } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Pedido } from './order/order.entity'; // Asegúrate de la ruta correcta
import { Estatus } from './status/status.entity'; // Asegúrate de la ruta correcta

@Injectable()
export class WorkerService {
    private readonly logger = new Logger(WorkerService.name);

    constructor(
        @InjectRepository(Pedido)
        private pedidoRepository: Repository<Pedido>,
        @InjectRepository(Estatus)
        private estatusRepository: Repository<Estatus>,
    ) {}

    async handleOrderCreated(data: { pedidoId: number; initialStatus: string }) {
        const { pedidoId, initialStatus } = data;
        this.logger.log(`[Order Created Event] Worker received event for Pedido ID: ${pedidoId}. Initial Status: ${initialStatus}`);
        const delay = 5 * 1000; // 5 segundos para pruebas. Cámbialo a 5 * 60 * 1000 para 5 minutos.

        this.logger.log(`[Order Processing] Setting a ${delay / 1000} second delay for Pedido ID: ${pedidoId}`);

        setTimeout(async () => {
            try {
                const pedido = await this.pedidoRepository.findOne({ 
                    where: { ID_Pedido: pedidoId }, 
                    relations: ['estatus'] // Asegúrate de cargar la relación 'estatus' para acceder a ella
                });

                if (pedido) {
                    // Si 'estatus' es una relación OneToMany y contiene el historial de estatus
                    // Debes obtener el ÚLTIMO estatus para compararlo
                    const currentStatusObject = Array.isArray(pedido.estatus) 
                        ? pedido.estatus[pedido.estatus.length - 1] // Asume que el último es el actual
                        : pedido.estatus; // Si por alguna razón es un solo objeto

                    const currentStatusName = currentStatusObject ? currentStatusObject.estatus : null;

                    // La condición de si actualizar o no es correcta
                    if (currentStatusName === initialStatus || currentStatusName === 'Pendiente') {
                        // 1. Crear una NUEVA entrada de estatus para "En Tránsito"
                        const newEstatusEnTransito = this.estatusRepository.create({ 
                            estatus: 'En Tránsito', 
                            fecha_hora: new Date(),
                            pedido: pedido // ¡Importante! Asigna el pedido al nuevo estatus
                        });
                        
                        await this.estatusRepository.save(newEstatusEnTransito); // Guarda la nueva entrada de estatus

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