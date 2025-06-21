import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Pedido } from '../order/order.entity';

@Entity('estatus') 
export class Estatus {
    @PrimaryGeneratedColumn({ type: 'int' })
    ID_Estatus: number;

    @Column({ nullable: false })
    estatus: string; 

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', nullable: false })
    fecha_hora: Date;

    @Column({ nullable: true })
    nota: string;

    @ManyToOne(() => Pedido, pedido => pedido.estatus)
    @JoinColumn({ name: 'ID_Pedido' })
    pedido: Pedido;
}