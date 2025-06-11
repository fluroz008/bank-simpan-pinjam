import express from "express";
import { authentication } from "../middlewares/authMiddleware";
import { deposit, withdraw } from "../controllers/transactionController";

const router = express.Router();

router.use(authentication); //Protect all routes

//Deposit
router.post('/customers/:id/deposit', deposit);
//Withdraw
router.post('/customers/:id/withdraw', withdraw);

export default router;