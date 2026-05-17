import { z } from 'zod';
import { ItemType, ToolType, Category, ManagementModel } from '../stock.enum';

export const CreateStockSchema = z.object({
    code: z.string().min(1),
    name: z.string().min(1),
    managementModel: z.enum(ManagementModel),
    baseConversionId: z.number().int().positive(),
    itemType: z.enum(ItemType),
    toolType: z.enum(ToolType),
    category: z.enum(Category),
    photo: z.string().optional().nullable(),
    description: z.string().optional(),
    conversionUnit: z.array(z.number()).optional(),
});


export type CreateStockValidator = z.infer<typeof CreateStockSchema>;
