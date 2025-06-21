import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Pedido } from 'src/order/order.entity';

@Entity('cliente')
export class Cliente {
    @PrimaryGeneratedColumn({ type: 'int' })
    ID_Cliente: number;

    @Column({ type: 'varchar', nullable: false })
    nombre: string;

    @Column({ unique: true, nullable: false })
    correo: string;

    @OneToMany(() => Pedido, pedido => pedido.cliente) 
    pedidos: Pedido[];
}