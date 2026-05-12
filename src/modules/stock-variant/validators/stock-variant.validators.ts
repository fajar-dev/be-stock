import { z } from 'zod';

export const CreateStockVariantSchema = z.object({
    stockId: z.coerce.number().int().positive(),
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(150),
    description: z.string().optional().nullable(),
    photo: z.union([z.instanceof(File), z.string()]).optional(),
    quantity: z.coerce.number().int().min(0).optional().nullable(),
});

export type CreateStockVariantValidator = z.infer<typeof CreateStockVariantSchema>;
