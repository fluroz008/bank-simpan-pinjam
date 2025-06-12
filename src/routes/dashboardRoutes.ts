import express from "express";
import { authentication } from "../middlewares/authMiddleware";
import { getCustomerBalanceSummary } from "../controllers/dashboardController";

const router = express.Router();

router.use(authentication);

//Dashboard summary
router.get('/dashboard', getCustomerBalanceSummary);

export default router;
