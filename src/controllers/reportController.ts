import { PrismaClient } from '../generated/prisma/client';
import { Request, Response } from 'express';
import { customerIdValid, dateRangeValid } from '../validations/transactionSchema';
import { z } from 'zod';

const prisma = new PrismaClient();

//Get customer total balance
export const balance = async ( req: Request, res: Response) => {
    //Customer ID param validation
    const paramResult = customerIdValid.safeParse({ customerId: req.params.id });
    if(!paramResult.success) {
        res.status(400).json({ message: "Invalid customer ID" });
        return;
    }
    const customerId = paramResult.data.customerId;

    try {
        //Customer check
        const customer = await prisma.customer.findFirst({
            where: {id: customerId, deleted: false}
        })

        if (!customer) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }

        const [depositAgg, withdrawAgg] = await Promise.all([
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: {
                customerId,
                status: "Deposit",
                },
            }),
            prisma.transaction.aggregate({
                _sum: { amount: true },
                where: {
                customerId,
                status: "Withdraw",
                },
            }),
        ]);

        const totalDeposit = depositAgg._sum.amount ?? 0;
        const totalWithdraw = withdrawAgg._sum.amount ?? 0;
        const balance = totalDeposit - totalWithdraw;

        res.status(200).json({ balance });
        return;
        } catch (err) {
            res.status(500).json({ error: "Internal Server Error" });
            return;
        }
};

//Get customer transaction based on date
export const customerDateFilter = async ( req: Request, res: Response) => {
    const paramResult = customerIdValid.safeParse({ customerId: req.params.id });
    const queryResult = dateRangeValid.extend({ page: z.string().optional() }).safeParse( req.query );

    if (!paramResult.success || !queryResult.success) {
        res.status(400).json({ message: "Invalid params or query" });
        return;
    }

    const customerId = paramResult.data.customerId;
    const { start_date, end_date, page } = queryResult.data;
    const currentPage = parseInt (page || "1", 10);
    const pageSize = 10;
    const skip = ( currentPage - 1 ) * pageSize;

    try {
        const customer = await prisma.customer.findFirst({
            where: { id: customerId, deleted: false}
        });

        if (!customer) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }

        const dateFilter: any = {};
        if (start_date) dateFilter.gte = new Date(start_date);
        if (end_date) dateFilter.lte = new Date(end_date);

        //Getting customer transactions data
        const [transactions, totalCount] = await Promise.all([
            prisma.transaction.findMany({
                where: {
                    customerId,
                    createdAt: Object.keys(dateFilter).length ? dateFilter : undefined,
                },
                include: {
                    customer: true,
                },
                orderBy: {createdAt: "desc"},
                skip,
                take: pageSize,
            }),
            prisma.transaction.count({
                where: {
                    customerId,
                    createdAt: Object.keys(dateFilter).length ? dateFilter : undefined,
                },
            }),
        ]);
        
        //Counting total for deposits and withdrawals
        const totalDeposit = transactions.filter((tx) => tx.status === "Deposit").reduce((sum, tx) => sum + tx.amount, 0);
        const totalWithdraw = transactions.filter((tx) => tx.status === "Withdraw").reduce((sum, tx) => sum + tx.amount, 0);

        res.status(200).json({
            page: currentPage,
            totalPages: Math.ceil( totalCount / pageSize ),
            totalCount,
            totalDeposit,
            totalWithdraw,
            transactions,
        });
        return;
    }
    catch(err) {
        res.status(500).json({ message: "Internal Server Error"});
    }
};

//Get all transactions based on date
export const getAllTransactions = async ( req: Request, res: Response) => {
    const queryResult = dateRangeValid.extend({ page: z.string().optional() }).safeParse(req.query);

    if (!queryResult.success) {
        res.status(400).json({ message: "Invalid query params" });
        return;
    }

    const { start_date, end_date, page } = queryResult.data;
    const currentPage = parseInt(page || "1", 10);
    const pageSize = 10;
    const skip = (currentPage - 1) * pageSize;

    try{
        const dateFilter: any = {};
            if (start_date) dateFilter.gte = new Date(start_date);
            if (end_date) dateFilter.lte = new Date(end_date);

            const [ transactions, totalCount ] = await Promise.all([
            prisma.transaction.findMany({
                where: {
                    createdAt: Object.keys(dateFilter).length ? dateFilter : undefined,
                },
                include: {
                    customer: true,
                },
                orderBy: { createdAt: "desc" },
                skip,
                take: pageSize,
            }),
            prisma.transaction.count({
                where: {
                    createdAt: Object.keys(dateFilter).length ? dateFilter : undefined,
                },
            }),
        ]);

        //Counting total for deposits and withdrawals
        const totalDeposit = transactions.filter((tx) => tx.status === "Deposit").reduce((sum, tx) => sum + tx.amount, 0);
        const totalWithdraw = transactions.filter((tx) => tx.status === "Withdraw").reduce((sum, tx) => sum + tx.amount, 0);

        res.status(200).json({
            page: currentPage,
            totalPages: Math.ceil( totalCount / pageSize ),
            totalCount,
            totalDeposit,
            totalWithdraw,
            transactions,
        });
        return;
    }
    catch(err) {
        res.status(500).json({ message: "Internal Server Error"});
    }

}