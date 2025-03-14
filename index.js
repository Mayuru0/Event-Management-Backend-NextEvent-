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
import path from 'path';


dotenv.config();

const app = express();
app.use(cors());

app.use(bodyParser.json());


connectDB();
app.use(errorHandler);


// const __dirname = path.resolve();
// app.use("/uploads", express.static(path.join(__dirname, "uploads")));



app.get('/', (req, res) => {
    res.send('Hello World!');
});

//User routes
app.use('/api/user', userRoute );



app.use("/api/event", eventRouter);


//contact routes
app.use('/api/contact', contactRoute);

app.use("/api/ticket", ticketRouter);

app.listen(PORT, () => {
    console.log(` 🚀 Server is up and running on port: ${PORT}`);
});

app.use(errorHandler);