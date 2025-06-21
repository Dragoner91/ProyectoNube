import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ClienteService } from './client.service';
import { Cliente } from './client.entity';

@Controller('client')
export class ClienteController {
    constructor(private readonly clienteService: ClienteService) {}

    @Get('view')
    async getClients(): Promise<Cliente[]> {
        return this.clienteService.findAllClients();
    }

    @Get('view/:id')
    async getClientById(@Param('id', ParseIntPipe) id: number): Promise<Cliente> {
        return this.clienteService.findOneClient(id);
    }

}