import express from 'express';
import { PORT } from "./src/config/env.js";
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from "cors";
import errorHandler from './src/middlewares/error.middleware.js';
import connectDB from './src/config/db.js';

import eventRouter from "./src/routes/eventRoute.js";
import contactRoute from './src/routes/contactRoute.js';
import ticketRouter from './src/routes/ticketRoute.js';
import userRoute from './src/routes/userRoute.js';
import reviewRoute from './src/routes/reviewRoute.js';
import paymentRoute from './src/routes/paymentRoute.js';

// Stripe webhook controller (needs raw body — must be registered before bodyParser)
import { stripeWebhook } from './src/controllers/ticketController.js';

dotenv.config();

const app = express();

app.use(cors());

// Stripe webhook must receive the raw request body — register BEFORE bodyParser.json()
app.post('/api/ticket/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

// Global JSON body parser (after webhook route)
app.use(bodyParser.json());

connectDB();
app.use(errorHandler);

app.get('/api/hello', (req, res) => {
    res.send('Hello World!');
});

// Routes
app.use('/api/user', userRoute);
app.use('/api/event', eventRouter);
app.use('/api/contact', contactRoute);
app.use('/api/ticket', ticketRouter);
app.use('/api/review', reviewRoute);
app.use('/api/payment', paymentRoute);

app.listen(PORT, () => {
    console.log(` 🚀 Server is up and running on port: ${PORT}`);
});

app.use(errorHandler);
