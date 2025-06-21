import { Controller } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { WorkerService } from './worker.service';

@Controller()
export class WorkerController {
    constructor(private readonly workerService: WorkerService) {}

    async handleOrderCreated(@Payload() data: { pedidoId: number; initialStatus: string }) {
        //
    }
}