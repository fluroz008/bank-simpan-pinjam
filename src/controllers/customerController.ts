import { PrismaClient } from "../generated/prisma/client";
import { Request, Response, NextFunction } from 'express';
import { createCustomerValid, updateCustomerValid } from "../validations/customerSchema";

const prisma = new PrismaClient();

//Get customer list
export const getAllCustomer = async ( req: Request, res: Response) => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const customer = await prisma.customer.findMany({
        where: { deleted: false},
        skip: ( page - 1)*limit,
        take: limit,
    })

    res.json(customer);
    return;
};

//Get customer details
export const getCustomerDetails = async ( req: Request, res: Response) => {
    const customerId = Number(req.params.id);

    const customer = await prisma.customer.findFirst({
        where: { id: customerId}
    });

    if (!customer) {
        res.status(404).json({ message: "Customer not found" });
        return;
    }

    res.json(customer);
    return;
}

//Create customer
export const createCustomer = async ( req: Request, res: Response) => {
    const result = createCustomerValid.safeParse(req.body);

    if(!result.success) {
        res.status(400).json({ errors: result.error.flatten().fieldErrors });
        return;
    }

    const data = result.data;

    const customer = await prisma.customer.create({
        data: {
            fullName: data.fullName,
            address: data.address,
            birthDate: new Date(data.birthDate),
            nik: data.nik
        },
    });

    res.status(201).json(customer);
    return;
};

//Update customer
export const updateCustomer = async ( req: Request, res: Response) => {
    const customerId = Number(req.params.id);
    const result = updateCustomerValid.safeParse(req.body);

    if(!result.success) {
        res.status(400).json({ errors: result.error.flatten().fieldErrors });
        return;
    }

    const existCustomer = await prisma.customer.findFirst({
        where: { id: customerId, deleted: false },
    });

    if(!existCustomer){
        res.status(404).json({ message: 'Customer not found or already deleted.' });
        return;
    }

    const updatedCustomer = await prisma.customer.update({
        where: { id: customerId},
        data: result.data
    });

    res.json(updatedCustomer);
    return;
};

//Delete customer
export const deleteCustomer = async ( req: Request, res: Response) => {
    const customerId = Number(req.params.id);

    const existCustomer = await prisma.customer.findFirst({
        where: { id: customerId , deleted: false}
    });

    if(!existCustomer){
        res.status(404).json({ message: 'Customer not found or already deleted.' });
        return;
    }

    await prisma.customer.update({
        where: { id: customerId },
        data: { deleted: true },
    });

    res.status(200).json({ message: 'Customer soft-deleted successfully' });
};