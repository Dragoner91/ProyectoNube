import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './client.entity';

@Injectable()
export class ClienteService {
    constructor(
        @InjectRepository(Cliente)
        private clienteRepository: Repository<Cliente>,
    ) {}

    async findAllClients(): Promise<Cliente[]> {
        return this.clienteRepository.find();
    }

    async findOneClient(id: number): Promise<Cliente> {
        const client = await this.clienteRepository.findOne({ where: { ID_Cliente: id } });
        if (!client) {
        throw new NotFoundException(`Cliente con ID ${id} no encontrado.`);
        }
        return client;
    }

}