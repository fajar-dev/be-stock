import { z } from 'zod'

export const CreateBranchSchema = z.object({
    code: z.string().min(1).max(50),
    name: z.string().min(1).max(100),
})

export type CreateBranchValidator = z.infer<typeof CreateBranchSchema>
