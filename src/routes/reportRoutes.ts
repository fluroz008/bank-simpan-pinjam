import express from "express";
import { authentication } from "../middlewares/authMiddleware";
import { balance, customerDateFilter, getAllTransactions } from "../controllers/reportController";

const router = express.Router();

router.use(authentication); //Protect all routes

//Get customer balance
router.get('/customers/:id/balance', balance);
//Get customer transactions history by date
router.get('/customers/:id/transactions', customerDateFilter)
//Get all transactions history by date
router.get('/all/transactions', getAllTransactions)

export default router;