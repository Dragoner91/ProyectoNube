import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { WorkerService } from './worker.service';

@Controller()
export class WorkerController {
    constructor(private readonly workerService: WorkerService) {}

    @EventPattern('pedido_creado')
    async handleOrderCreated(
        @Payload() data: { pedidoId: number; initialStatus: string },
        @Ctx() context: RmqContext
    ) {
        await this.workerService.handlePedidoCreado(data, context);
    }
}