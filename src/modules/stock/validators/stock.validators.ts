import { z } from 'zod';
import { ItemType, ToolType, Category, ManagementModel } from '../stock.enum';

export const CreateStockSchema = z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    managementModel: z.enum(ManagementModel),
    unitId: z.string().transform(Number),
    itemType: z.enum(ItemType),
    toolType: z.enum(ToolType),
    category: z.enum(Category),
    photo: z.union([z.instanceof(File), z.string()]).optional(),
    description: z.string().optional(),
    conversionUnit: z.preprocess((val) => {
        if (!val) return undefined;
        if (typeof val === 'string') {
            try { return JSON.parse(val).map(Number); } catch { return val.split(',').filter(Boolean).map(Number); }
        }
        if (Array.isArray(val)) return val.map(Number);
        return [Number(val)];
    }, z.array(z.number())).optional(),
});


export type CreateStockValidator = z.infer<typeof CreateStockSchema>;
