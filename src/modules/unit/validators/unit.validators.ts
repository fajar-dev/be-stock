import { z } from 'zod'

export const CreateUnitSchema = z.object({
    name: z.string().min(1).max(100),
    isActive: z.boolean().default(true),
})

export type CreateUnitValidator = z.infer<typeof CreateUnitSchema>
