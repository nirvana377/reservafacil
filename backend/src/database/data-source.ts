import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../entities/User';
import { Table } from '../entities/Table';
import { Reservation } from '../entities/Reservation';
import { TimeSlot } from '../entities/TimeSlot';

dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    synchronize: true,
    logging: false,
    entities: [User, Table, Reservation, TimeSlot],
});