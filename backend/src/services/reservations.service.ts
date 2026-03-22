import { AppDataSource } from '../database/data-source';
import { Reservation } from '../entities/Reservation';
import { Table } from '../entities/Table';

const reservationRepo = () => AppDataSource.getRepository(Reservation);
const tableRepo = () => AppDataSource.getRepository(Table);

// ⭐ EL ENDPOINT ESTRELLA — lógica SQL compleja
export const getAvailability = async (date: string, guests: number, timeStart: string) => {
    const timeEnd = calculateTimeEnd(timeStart, 90);

    // Query complejo: mesas activas que NO tienen reserva que se solape
    const availableTables = await tableRepo()
        .createQueryBuilder('table')
        .where('table.isActive = :active', { active: true })
        .andWhere('table.capacity >= :guests', { guests })
        .andWhere(`table.id NOT IN (
      SELECT r.table_id FROM reservations r
      WHERE r.date = :date
      AND r.status NOT IN ('cancelled')
      AND (
        (r.time_start < :timeEnd AND r.time_end > :timeStart)
      )
    )`, { date, timeStart, timeEnd })
        .orderBy('table.capacity', 'ASC')
        .getMany();

    return {
        date,
        timeStart,
        timeEnd,
        guests,
        availableTables
    };
};

export const createReservation = async (data: {
    date: string;
    timeStart: string;
    guests: number;
    notes?: string;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    tableId: number;
    userId?: number;
}) => {
    const timeEnd = calculateTimeEnd(data.timeStart, 90);

    // Transacción para evitar doble booking
    return await AppDataSource.transaction(async (manager) => {
        // 1. Verificar que la mesa existe y tiene capacidad
        const table = await manager.findOne(Table, { where: { id: data.tableId } });
        if (!table) throw new Error('Mesa no encontrada');
        if (table.capacity < data.guests) throw new Error(`La mesa solo tiene capacidad para ${table.capacity} personas`);

        // 2. Verificar disponibilidad dentro de la transacción (evita race conditions)
        const conflict = await manager
            .createQueryBuilder(Reservation, 'r')
            .where('r.table = :tableId', { tableId: data.tableId })
            .andWhere('r.date = :date', { date: data.date })
            .andWhere('r.status NOT IN (:...statuses)', { statuses: ['cancelled'] })
            .andWhere('r.timeStart < :timeEnd AND r.timeEnd > :timeStart', {
                timeStart: data.timeStart,
                timeEnd
            })
            .getOne();

        if (conflict) throw new Error('La mesa ya está reservada en ese horario');

        // 3. Crear la reserva
        const reservation = manager.create(Reservation, {
            date: data.date,
            timeStart: data.timeStart,
            timeEnd,
            guests: data.guests,
            notes: data.notes,
            guestName: data.guestName,
            guestEmail: data.guestEmail,
            guestPhone: data.guestPhone,
            table: { id: data.tableId },
            user: data.userId ? { id: data.userId } : undefined,
            status: 'pending'
        });

        return await manager.save(reservation);
    });
};

export const getReservations = async (filters: { date?: string; status?: string }) => {
    const query = reservationRepo()
        .createQueryBuilder('reservation')
        .leftJoinAndSelect('reservation.table', 'table')
        .leftJoinAndSelect('reservation.user', 'user')
        .orderBy('reservation.date', 'DESC')
        .addOrderBy('reservation.timeStart', 'ASC');

    if (filters.date) query.andWhere('reservation.date = :date', { date: filters.date });
    if (filters.status) query.andWhere('reservation.status = :status', { status: filters.status });

    return await query.getMany();
};

export const getMyReservations = async (userId: number) => {
    return await reservationRepo()
        .createQueryBuilder('reservation')
        .leftJoinAndSelect('reservation.table', 'table')
        .where('reservation.user = :userId', { userId })
        .orderBy('reservation.date', 'DESC')
        .getMany();
};

export const updateReservationStatus = async (id: number, status: string) => {
    const reservation = await reservationRepo().findOne({ where: { id } });
    if (!reservation) throw new Error('Reserva no encontrada');

    reservation.status = status as any;
    return await reservationRepo().save(reservation);
};

export const cancelReservation = async (id: number, userId: number, isAdmin: boolean) => {
    const reservation = await reservationRepo().findOne({
        where: { id },
        relations: ['user']
    });

    if (!reservation) throw new Error('Reserva no encontrada');

    // Solo el dueño o admin puede cancelar
    if (!isAdmin && reservation.user?.id !== userId)
        throw new Error('No tienes permiso para cancelar esta reserva');

    if (reservation.status === 'cancelled')
        throw new Error('La reserva ya está cancelada');

    // Regla: mínimo 2 horas antes
    if (!isAdmin) {
        const reservationDateTime = new Date(`${reservation.date}T${reservation.timeStart}`);
        const now = new Date();
        const diffHours = (reservationDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        if (diffHours < 2) throw new Error('Solo puedes cancelar con mínimo 2 horas de anticipación');
    }

    reservation.status = 'cancelled';
    return await reservationRepo().save(reservation);
};

// Helper: calcula hora de fin sumando minutos
const calculateTimeEnd = (timeStart: string, minutes: number): string => {
    const [hours, mins] = timeStart.split(':').map(Number);
    const totalMins = hours * 60 + mins + minutes;
    const endHours = Math.floor(totalMins / 60);
    const endMins = totalMins % 60;
    return `${String(endHours).padStart(2, '0')}:${String(endMins).padStart(2, '0')}`;
};