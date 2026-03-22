import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm';
import { User } from './User';
import { Table } from './Table';

@Entity('reservations')
@Index(['table', 'date', 'timeStart'])
export class Reservation {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, user => user.reservations)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @ManyToOne(() => Table, table => table.reservations)
    @JoinColumn({ name: 'table_id' })
    table: Table;

    @Column({ type: 'date' })
    date: string;

    @Column({ name: 'time_start' })
    timeStart: string;

    @Column({ name: 'time_end' })
    timeEnd: string;

    @Column()
    guests: number;

    @Column({ default: 'pending' })
    status: 'pending' | 'confirmed' | 'cancelled' | 'completed';

    @Column({ nullable: true })
    notes: string;

    @Column({ nullable: true, name: 'guest_name' })
    guestName: string;

    @Column({ nullable: true, name: 'guest_email' })
    guestEmail: string;

    @Column({ nullable: true, name: 'guest_phone' })
    guestPhone: string;

    @CreateDateColumn()
    createdAt: Date;
}