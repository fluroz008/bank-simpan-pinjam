import { PrismaClient } from "../generated/prisma/client";
import { Request, Response } from 'express';
import { amountValid, customerIdValid } from "../validations/transactionSchema";

const prisma = new PrismaClient();

//Deposit
export const deposit = async ( req: Request, res: Response ) => {
    //Customer ID param validation
    const paramResult = customerIdValid.safeParse({ customerId: req.params.id });
    if(!paramResult.success) {
        res.status(400).json({ message: "Invalid customer ID" });
        return;
    }
    const customerId = paramResult.data.customerId;

    //Body data validation
    const bodyResult = amountValid.safeParse(req.body);
    if(!bodyResult.success) {
        res.status(400).json({ errors: bodyResult.error.flatten().fieldErrors });
        return;
    }

    const { amount } = bodyResult.data;
    const teller = (req as any).user;
    const tellerId = teller?.userId;
    const tellerName = teller?.name;

    try {
        //Customer check
        const customer = await prisma.customer.findFirst({
            where: {id: customerId, deleted: false}
        })

        if (!customer) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }

        //Deposit transaction
        const transaction = await prisma.$transaction(async (tx) => {
            return await tx.transaction.create({
                data: {
                    customerId,
                    tellerId,
                    tellerName,
                    status: "Deposit",
                    amount
                },
            });
        });

        res.status(201).json({ message:  "Deposit successful", transaction });
    }
    catch(err) {
        res.status(500).json({ error: "Transaction failed" })
        return;
    }
};

//Withdraw
export const withdraw = async ( req: Request, res: Response ) => {
    //Customer ID param validation
    const paramResult = customerIdValid.safeParse({ customerId: req.params.id });
    if(!paramResult.success) {
        res.status(400).json({ message: "Invalid customer ID" });
        return;
    }
    const customerId = paramResult.data.customerId;

    //Body data validation
    const bodyResult = amountValid.safeParse(req.body);
    if(!bodyResult.success) {
        res.status(400).json({ errors: bodyResult.error.flatten().fieldErrors });
        return;
    }
    const { amount } = bodyResult.data;
    const teller = (req as any).user;
    const tellerId = teller?.userId;
    const tellerName = teller?.name;

    try {
        //Customer check
        const customer = await prisma.customer.findFirst({
            where: {id: customerId, deleted: false}
        })

        if (!customer) {
            res.status(404).json({ message: "Customer not found" });
            return;
        }

        const transactions = await prisma.transaction.findMany({
            where: {customerId }
        });

        //Calculate balance: deposits - withdrawals
        const balance = transactions.reduce((total, tx) => {
            return tx.status === "Deposit" ? total + tx.amount : total - tx.amount;
        }, 0);

        if (amount > balance) {
            res.status(400).json({ message:"Insufficient balance" });
            return;
        }

        //Proceed with withdrawal transaction
        const newTransaction = await prisma.$transaction(async (tx) => {
            return await tx.transaction.create({
                data: {
                    customerId,
                    tellerId,
                    tellerName,
                    status: "Withdraw",
                    amount,
                },
            });
        });

        res.status(201).json({ message: "Withdrawal successful", newTransaction });
    }
    catch(err) {
        res.status(500).json({ error: "Transaction failed" })
        return;
    }
};