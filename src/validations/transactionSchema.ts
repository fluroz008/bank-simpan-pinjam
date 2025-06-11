import { z } from 'zod';

export const amountValid = z.object ({
    amount: z.number().positive()
})

export const customerIdValid = z.object ({
    customerId: z.string().regex(/^\d+$/).transform(Number)
})

export const dateRangeValid = z.object ({
    start_date: z.string().optional(),
    end_date: z.string().optional()
})