import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { createContact, deleteContact, getContacts } from "../controllers/contactController.js";


const contactRoute = express.Router();

//post routes
contactRoute.post('/create', authMiddleware, createContact);

//get contact routes
contactRoute.get('/get', authMiddleware, getContacts);


//delete contact routes
contactRoute.delete('/delete/:contactId', authMiddleware, deleteContact);


export default contactRoute;