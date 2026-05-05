import { z } from 'zod'

export const CreateStockSchema = z.object({
    name: z.string().min(1).max(150),
    sku: z.string().min(1).max(100),
    quantity: z.number().int().min(0).default(0),
    unit: z.string().min(1).max(50).default('pcs'),
    price: z.number().min(0).default(0),
    description: z.string().nullable().optional(),
})

export const UpdateStockSchema = CreateStockSchema.partial()

export type CreateStockValidator = z.infer<typeof CreateStockSchema>
export type UpdateStockValidator = z.infer<typeof UpdateStockSchema>
