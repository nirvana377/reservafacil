import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('time_slots')
export class TimeSlot {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ name: 'start_time' })
    startTime: string;

    @Column({ name: 'end_time' })
    endTime: string;

    @Column({ name: 'duration_minutes', default: 90 })
    durationMinutes: number;

    @Column({ default: true })
    isActive: boolean;
}