import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from './order.entity';
import { Producto } from 'src/product/product.entity';

@Entity('producto_pedido')
export class ProductoPedido {
    @PrimaryGeneratedColumn()
    ID_Producto_Pedido: number;

    @ManyToOne(() => Producto, producto => producto.productosPedidos, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'ID_Producto' })
    producto: Producto;

    @ManyToOne(() => Pedido, pedido => pedido.productosPedidos, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ID_Pedido' })
    pedido: Pedido;

    @Column()
    cantidad: number;
}