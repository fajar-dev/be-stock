import { z } from 'zod';

const BulkVariantSchema = z.object({
    photo: z.string().optional().nullable(),
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(150),
    branchId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().nonnegative().optional(),
    description: z.string().optional().nullable(),
});

export const CreateStockVariantSchema = z.object({
    stockId: z.coerce.number().int().positive(),
    variant: z.array(BulkVariantSchema).min(1),
});

export type CreateStockVariantValidator = z.infer<typeof CreateStockVariantSchema>;
