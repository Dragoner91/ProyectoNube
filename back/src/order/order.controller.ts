import { Controller, Post, Body, Get, Param, ParseIntPipe, HttpCode, HttpStatus } from '@nestjs/common';
import { PedidoService } from './order.service';
import { CreatePedidoDto } from './create-order.dto';
import { Pedido } from './order.entity';

@Controller('order')
export class PedidoController {
    constructor(private readonly pedidoService: PedidoService) {}

    @Post('create')
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createPedidoDto: CreatePedidoDto): Promise<Pedido> {
        return this.pedidoService.createPedido(createPedidoDto);
    }

    @Get()
    async findAll(): Promise<Pedido[]> {
        return this.pedidoService.findAllPedidos();
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number): Promise<Pedido> {
        return this.pedidoService.findOnePedido(id);
    }
}