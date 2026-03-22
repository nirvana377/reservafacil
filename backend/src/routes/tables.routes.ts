import { Router, Response } from 'express';
import { authMiddleware, adminMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { getAllTables, getTableById, createTable, updateTable, deleteTable } from '../services/tables.service';

const router = Router();

// GET /api/tables — público, cualquiera puede ver las mesas
router.get('/', async (req, res) => {
    try {
        const tables = await getAllTables();
        res.json(tables);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
});

// GET /api/tables/:id
router.get('/:id', async (req, res) => {
    try {
        const table = await getTableById(Number(req.params.id));
        res.json(table);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
});

// POST /api/tables — solo admin
router.post('/', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const { number, capacity, zone } = req.body;

        if (!number || !capacity || !zone)
            return res.status(400).json({ message: 'Número, capacidad y zona son requeridos' });

        const table = await createTable({ number, capacity, zone });
        res.status(201).json(table);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// PUT /api/tables/:id — solo admin
router.put('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const table = await updateTable(Number(req.params.id), req.body);
        res.json(table);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// DELETE /api/tables/:id — solo admin
router.delete('/:id', authMiddleware, adminMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const result = await deleteTable(Number(req.params.id));
        res.json(result);
    } catch (error: any) {
        res.status(404).json({ message: error.message });
    }
});

export default router;