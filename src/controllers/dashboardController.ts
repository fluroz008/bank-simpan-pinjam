import { PrismaClient } from '../generated/prisma/client';
import { Request, Response } from 'express';
import { z } from 'zod';

const prisma = new PrismaClient();

const singleDateValid = z.object({
  date: z.string().refine(val => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export const getCustomerBalanceSummary = async ( req: Request, res: Response ) => {
    const page = parseInt( req.query.page as string ) || 1;
    const pageSize = 10;
    const skip = ( page - 1 ) * pageSize;
  
    try {
        const totalCustomers = await prisma.customer.count({
            where: { deleted: false },
        });

        const customers = await prisma.customer.findMany({
            where: { deleted: false },
            skip,
            take: pageSize,
            select: {
                    id: true,
                    fullName: true,
                    transactions: {
                    select: {
                        status: true,
                        amount: true
                    }
                }
            }
        });

        const summary = customers.map((customer) => {
        const balance = customer.transactions.reduce((total, tx) => {
            return tx.status === "Deposit" ? total + tx.amount : total - tx.amount;
        }, 0);

            return {
                customerId: customer.id,
                name: customer.fullName,
                balance,
            };
        });

        res.status(200).json({
            page,
            pageSize,
            totalPages: Math.ceil( totalCustomers / pageSize ),
            totalCustomers,
            data: summary
        });
    }
    catch (err) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};

