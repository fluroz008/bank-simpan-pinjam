import express from 'express';
import config from './configs/config';
import userRoute from './routes/userRoutes';
import customerRoute from './routes/customerRoutes';
import transactionRoute from './routes/transactionRoutes';
import reportRoute from './routes/reportRoutes';
import dashboardRoute from './routes/dashboardRoutes';

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
//Dashboard routes
app.use(dashboardRoute);

app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`)
});

