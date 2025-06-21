import { Controller, Get, Param, ParseIntPipe, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ProductoService } from './product.service';
import { Producto } from './product.entity';

@Controller('product') // Puedes usar un prefijo de 'view' si quieres que todos los GET estén bajo este prefijo
export class ProductoController {
    constructor(private readonly productoService: ProductoService) {}

    @Get('view')
    async getProducts(): Promise<Producto[]> {
        return this.productoService.findAllProducts();
    }

    @Get('view/:id')
    async getProductById(@Param('id', ParseIntPipe) id: number): Promise<Producto> {
        return this.productoService.findOneProduct(id);
    }

}