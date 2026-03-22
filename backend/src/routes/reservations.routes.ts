import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth.middleware';
import {
    getAvailability, createReservation, getReservations,
    getMyReservations, updateReservationStatus, cancelReservation
} from '../services/reservations.service';

const router = Router();

// GET /api/reservations/availability?date=2024-12-20&guests=2&time=19:00
router.get('/availability', async (req: Request, res: Response) => {
    try {
        const { date, guests, time } = req.query;
        if (!date || !guests || !time)
            return res.status(400).json({ message: 'date, guests y time son requeridos' });

        const result = await getAvailability(
            date as string,
            Number(guests),
            time as string
        );
        res.json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// POST /api/reservations — crear reserva (público o con cuenta)
// POST /api/reservations — crear reserva
router.post('/', async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;
        let userId: number | undefined;

        if (authHeader) {
            try {
                const token = authHeader.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
                userId = decoded.id;
            } catch { }
        }

        const { date, timeStart, guests, notes, guestName, guestEmail, guestPhone, tableId } = req.body;

        if (!date || !timeStart || !guests || !guestName || !guestEmail || !tableId)
            return res.status(400).json({ message: 'Faltan campos requeridos' });

        const reservation = await createReservation({
            date, timeStart, guests, notes,
            guestName, guestEmail, guestPhone, tableId,
            userId
        });
        res.status(201).json(reservation);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});
// GET /api/reservations — todas (solo admin)
router.get('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { date, status } = req.query;
        const reservations = await getReservations({
            date: date as string,
            status: status as string
        });
        res.json(reservations);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/reservations/my — mis reservas (usuario autenticado)
router.get('/my', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const reservations = await getMyReservations(req.user!.id);
        res.json(reservations);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// PATCH /api/reservations/:id/status — confirmar/rechazar (solo admin)
router.patch('/:id/status', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { status } = req.body;
        if (!['confirmed', 'cancelled', 'completed'].includes(status))
            return res.status(400).json({ message: 'Status inválido' });

        const reservation = await updateReservationStatus(Number(req.params.id), status);
        res.json(reservation);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// PATCH /api/reservations/:id/cancel — cancelar reserva
router.patch('/:id/cancel', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const isAdmin = req.user!.role === 'admin';
        const reservation = await cancelReservation(
            Number(req.params.id),
            req.user!.id,
            isAdmin
        );
        res.json(reservation);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

export default router;