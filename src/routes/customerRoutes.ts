import express from "express";
import { authentication } from "../middlewares/authMiddleware";
import { createCustomer, deleteCustomer, getAllCustomer, getCustomerDetails, updateCustomer } from "../controllers/customerController";

const router = express.Router();

router.use(authentication); //Protect all routes

//Get all customers
router.get('/customers/', getAllCustomer);
//Get a customer details
router.get('/customers/:id', getCustomerDetails);
//Create customer
router.post('/customers', createCustomer);
//Update customer
router.put('/customers/:id', updateCustomer);
//Delete customer
router.delete('/customers/:id', deleteCustomer);


export default router;