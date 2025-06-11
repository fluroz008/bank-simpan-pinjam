import express from 'express';
import config from './configs/config';
import userRoute from '../src/routes/userRoutes';
import customerRoute from '../src/routes/customerRoutes';
import transactionRoute from '../src/routes/transactionRoutes';
import reportRoute from '../src/routes/reportRoutes';

const app = express();

app.use(express.json());

//User routes
app.use(userRoute);
//Customer routes
app.use(customerRoute);
//Transaction routes
app.use(transactionRoute);
//Report routes
app.use(reportRoute);

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`)
});

