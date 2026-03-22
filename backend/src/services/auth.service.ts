import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../database/data-source';
import { User } from '../entities/User';

const userRepo = () => AppDataSource.getRepository(User);

export const registerUser = async (name: string, email: string, password: string) => {
    const existing = await userRepo().findOne({ where: { email } });
    if (existing) throw new Error('El email ya está registrado');

    const hashed = await bcrypt.hash(password, 10);
    const user = userRepo().create({ name, email, password: hashed });
    await userRepo().save(user);

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
    );

    return {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
};

export const loginUser = async (email: string, password: string) => {
    const user = await userRepo().findOne({ where: { email } });
    if (!user) throw new Error('Credenciales inválidas');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error('Credenciales inválidas');

    if (!user.isActive) throw new Error('Cuenta desactivada');

    const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET!,
        { expiresIn: '7d' }
    );

    return {
        token,
        user: { id: user.id, name: user.name, email: user.email, role: user.role }
    };
};