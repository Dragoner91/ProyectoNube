import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Producto } from './product.entity';

@Injectable()
export class ProductoService {
    constructor(
        @InjectRepository(Producto)
        private productoRepository: Repository<Producto>,
    ) {}

    async findAllProducts(): Promise<Producto[]> {
        return this.productoRepository.find();
    }

    async findOneProduct(id: number): Promise<Producto> {
        const product = await this.productoRepository.findOne({ where: { ID_Producto: id } });
        if (!product) {
        throw new NotFoundException(`Producto con ID ${id} no encontrado.`);
        }
        return product;
    }

}