import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Estatus } from 'src/status/status.entity';

@Entity('pedido')
export class Pedido {
    @PrimaryGeneratedColumn({ type: 'int'})
    ID_Pedido: number;

    @Column({ type: 'varchar', nullable: false})
    direccion: string;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    total_a_pagar: number;

    @OneToMany(() => Estatus, estatus => estatus.pedido, { cascade: ['insert'], onDelete: 'CASCADE' })
    estatus: Estatus[];

}