import { z } from 'zod';
import { ItemType, ToolType, Category, ManagementModel } from '../stock.enum';

export const CreateStockSchema = z.object({
    code: z.string().min(1, 'Kode Barang wajib diisi'),
    name: z.string().min(1, 'Nama Barang wajib diisi'),
    managementModel: z.enum(ManagementModel, { error: 'Invalid item management model' }),
    unitId: z.number({ error: 'Unit is required' }).positive('Unit is required'),
    itemType: z.enum(ItemType, { error: 'Invalid item type' }),
    toolType: z.enum(ToolType, { error: 'Invalid tool type' }),
    category: z.enum(Category, { error: 'Invalid category' }),
    photo: z.string().optional(),
    description: z.string().optional(),
    conversionUnit: z.array(z.number()).optional(),
});


export type CreateStockValidator = z.infer<typeof CreateStockSchema>;
