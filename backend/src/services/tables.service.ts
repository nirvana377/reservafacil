import { AppDataSource } from '../database/data-source';
import { Table } from '../entities/Table';

const tableRepo = () => AppDataSource.getRepository(Table);

export const getAllTables = async () => {
    return await tableRepo().find({ order: { number: 'ASC' } });
};

export const getTableById = async (id: number) => {
    const table = await tableRepo().findOne({ where: { id } });
    if (!table) throw new Error('Mesa no encontrada');
    return table;
};

export const createTable = async (data: {
    number: number;
    capacity: number;
    zone: 'interior' | 'exterior' | 'terraza' | 'bar';
}) => {
    const existing = await tableRepo().findOne({ where: { number: data.number } });
    if (existing) throw new Error(`La mesa #${data.number} ya existe`);

    const table = tableRepo().create(data);
    return await tableRepo().save(table);
};

export const updateTable = async (id: number, data: Partial<Table>) => {
    const table = await tableRepo().findOne({ where: { id } });
    if (!table) throw new Error('Mesa no encontrada');

    tableRepo().merge(table, data);
    return await tableRepo().save(table);
};

export const deleteTable = async (id: number) => {
    const table = await tableRepo().findOne({ where: { id } });
    if (!table) throw new Error('Mesa no encontrada');

    await tableRepo().remove(table);
    return { message: 'Mesa eliminada correctamente' };
};