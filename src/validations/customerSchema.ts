import { z } from 'zod';

export const createCustomerValid = z.object ({
    fullName: z.string().min(3),
    address: z.string().min(5),
    birthDate: z.string().refine(date => !isNaN(Date.parse(date)), {
        message: "Invalid date format"
    }),
    nik: z.string().min(16)
})

export const updateCustomerValid = z.object ({
  fullName: z.string().min(3).optional(),
  address: z.string().min(5).optional(),
  nik: z.string().length(16).optional(),
  birthDate: z
    .string()
    .transform((val) => new Date(val))
    .optional()
})