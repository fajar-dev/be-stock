import { z } from 'zod';

const BulkItemSchema = z.object({
    lot: z.string().min(1).max(100).optional().nullable(),
    serialNumber: z.string().min(1).max(100).optional().nullable(),
    quantity: z.coerce.number().int().min(1).optional(),
});

const BulkVariantSchema = z.object({
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(150),
    description: z.string().optional().nullable(),
    quantity: z.coerce.number().int().min(0).optional(),
    item: z.array(BulkItemSchema).optional(),
});

export const CreateStockVariantSchema = z.object({
    stockId: z.coerce.number().int().positive(),
    variant: z.array(BulkVariantSchema).min(1),
});

export type CreateStockVariantValidator = z.infer<typeof CreateStockVariantSchema>;
