import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { ProductoPedido } from './order_product.entity';
import { Cliente } from 'src/client/client.entity';
import { Estatus } from 'src/status/status.entity';

@Entity('pedido')
export class Pedido {
    @PrimaryGeneratedColumn({ type: 'int'})
    ID_Pedido: number;

    @Column({ type: 'varchar', nullable: false})
    direccion: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total_a_pagar: number;

    @ManyToOne(() => Cliente, cliente => cliente.pedidos, { onDelete: 'SET NULL' })
    @JoinColumn({ name: 'ID_Cliente' })
    cliente: Cliente;

    @OneToMany(() => Estatus, estatus => estatus.pedido, { cascade: ['insert'], onDelete: 'CASCADE' })
    estatus: Estatus[];

    @OneToMany(() => ProductoPedido, productoPedido => productoPedido.pedido, { cascade: ['insert'], onDelete: 'CASCADE' })
    productosPedidos: ProductoPedido[];
}