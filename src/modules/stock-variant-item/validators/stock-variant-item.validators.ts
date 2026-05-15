import { z } from 'zod';

const BulkItemSchema = z.object({
    lot: z.string().min(1).max(100).optional().nullable(),
    serialNumber: z.string().min(1).max(100).optional().nullable(),
    quantity: z.coerce.number().int().min(1).optional(),
});

export const CreateStockVariantItemSchema = z.object({
    stockVariantId: z.coerce.number().int().positive(),
    item: z.array(BulkItemSchema).min(1),
});

export type CreateStockVariantItemValidator = z.infer<typeof CreateStockVariantItemSchema>;
