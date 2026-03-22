import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from './database/data-source';
import authRoutes from './routes/auth.routes';
import tablesRoutes from './routes/tables.routes';
import reservationsRoutes from './routes/reservations.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/api/reservations', reservationsRoutes); // Rutas de reservas (disponibilidad, creación, gestión)

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/tables', tablesRoutes);
// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', message: 'ReservaFácil API running' });
});

AppDataSource.initialize()
    .then(() => {
        console.log('✅ PostgreSQL conectado');
        app.listen(PORT, () => {
            console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
        });
    })
    .catch((error) => {
        console.error('❌ Error conectando a la DB:', error);
    });