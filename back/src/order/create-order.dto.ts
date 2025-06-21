import { Type } from "class-transformer";
import { IsNotEmpty, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator";
import { ProductoPedidoDto } from "./order.dto";

export class CreatePedidoDto {
    @IsString()
    @IsNotEmpty()
    direccion: string;

    @IsNumber()
    @IsNotEmpty()
    total_a_pagar: number;

    @IsNumber()
    @IsNotEmpty()
    ID_Cliente: number; // ID del cliente existente

    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => ProductoPedidoDto)
    productos: ProductoPedidoDto[]; // Array de productos en el pedido
}