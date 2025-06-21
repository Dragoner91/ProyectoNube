import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductoPedido } from 'src/order/order_product.entity';

@Entity('producto')
export class Producto {
    @PrimaryGeneratedColumn({ type: 'int' })
    ID_Producto: number;

    @Column({ type: 'varchar', nullable: false })
    nombre: string;

    @Column({ type: 'bool', nullable: true })
    disponibilidad: boolean;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    peso: number;

    @OneToMany(() => ProductoPedido, productoPedido => productoPedido.producto)
    productosPedidos: ProductoPedido[];
}