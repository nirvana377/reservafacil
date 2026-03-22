import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Reservation } from './Reservation';

@Entity('tables')
export class Table {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    number: number;

    @Column()
    capacity: number;

    @Column({ default: 'interior' })
    zone: 'interior' | 'exterior' | 'terraza' | 'bar';

    @Column({ default: true })
    isActive: boolean;

    @OneToMany(() => Reservation, reservation => reservation.table)
    reservations: Reservation[];
}