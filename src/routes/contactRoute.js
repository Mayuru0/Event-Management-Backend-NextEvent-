import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { createContact, deleteContact, getContacts } from "../controllers/contactController.js";


const contactRoute = express.Router();

//post routes — open to guests (no auth required)
contactRoute.post('/create', createContact);

//get contact routes — protected (admin/organizer only)
contactRoute.get('/get', authMiddleware, getContacts);

//delete contact routes — protected
contactRoute.delete('/delete/:contactId', authMiddleware, deleteContact);


export default contactRoute;