import { z } from 'zod'

export const CreateConversionSchema = z.object({
    name: z.string().min(1).max(150),
    unitBasicId: z.number().int().positive(),
    value: z.number().positive(),
    unitConversionId: z.number().int().positive(),
})

export type CreateConversionValidator = z.infer<typeof CreateConversionSchema>
