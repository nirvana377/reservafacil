import { Router, Request, Response } from 'express';
import { registerUser, loginUser } from '../services/auth.service';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { AppDataSource } from '../database/data-source';
import { User } from '../entities/User';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password)
            return res.status(400).json({ message: 'Todos los campos son requeridos' });

        if (password.length < 6)
            return res.status(400).json({ message: 'La contraseña debe tener mínimo 6 caracteres' });

        const result = await registerUser(name, email, password);
        res.status(201).json(result);
    } catch (error: any) {
        res.status(400).json({ message: error.message });
    }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ message: 'Email y contraseña requeridos' });

        const result = await loginUser(email, password);
        res.json(result);
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
});

// GET /api/auth/me — verifica token y retorna usuario actual
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const user = await AppDataSource.getRepository(User).findOne({
            where: { id: req.user!.id }
        });
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    } catch {
        res.status(500).json({ message: 'Error interno' });
    }
});

export default router;