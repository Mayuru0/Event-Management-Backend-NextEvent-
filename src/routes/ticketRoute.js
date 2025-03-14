import express from "express";
import { addTicket, deleteTicket, getTicketById, getTickets, updateTicket,getTicketsUserId,getTicketsorganizerId, createCheckoutSession } from "../controllers/ticketController.js";
import authMiddleware from "../middlewares/authMiddleware.js";


const ticketRouter = express.Router();

//create routes
ticketRouter.post("/add",authMiddleware, addTicket);

//update routes
ticketRouter.put("/tickets/:ticketId",authMiddleware, updateTicket);

//get routes
ticketRouter.get("/get" ,authMiddleware,getTickets);

//get user tickers userid
ticketRouter.get("/:userId" ,authMiddleware,getTicketsUserId);

//get user tickets organizerId
ticketRouter.get("/customer/:organizerId" ,authMiddleware,getTicketsorganizerId);


ticketRouter.get("/:ticketId",authMiddleware,getTicketById );

//delete routes
ticketRouter.delete("/delete/:ticketId",authMiddleware, deleteTicket);

ticketRouter.post("/create-checkout-session", authMiddleware, createCheckoutSession);
export default ticketRouter;
