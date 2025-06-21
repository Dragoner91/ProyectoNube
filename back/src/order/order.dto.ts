import { IsNumber, IsNotEmpty } from 'class-validator';

export class ProductoPedidoDto {
    @IsNumber()
    @IsNotEmpty()
    ID_Producto: number; // El ID del producto existente

    @IsNumber()
    @IsNotEmpty()
    cantidad: number;
}