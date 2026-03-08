import express from "express";
import {
  addTicket,
  deleteTicket,
  getTicketById,
  getTickets,
  updateTicket,
  getTicketsUserId,
  getTicketsorganizerId,
  getOrganizerStats,
  createCheckoutSession,
  stripeWebhook,
  verifyPayment,
} from "../controllers/ticketController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const ticketRouter = express.Router();

// Stripe webhook — raw body required, no auth middleware
ticketRouter.post("/webhook", express.raw({ type: "application/json" }), stripeWebhook);

// Create
ticketRouter.post("/add", authMiddleware, addTicket);
ticketRouter.post("/create-checkout-session", authMiddleware, createCheckoutSession);

// Get all tickets
ticketRouter.get("/get", authMiddleware, getTickets);

// Specific named routes BEFORE generic /:id routes
ticketRouter.get("/user/:userId", authMiddleware, getTicketsUserId);
ticketRouter.get("/customer/:organizerId", authMiddleware, getTicketsorganizerId);
ticketRouter.get("/stats/:organizerId", authMiddleware, getOrganizerStats);

// Generic single ticket route (must be last GET)
ticketRouter.get("/:ticketId", authMiddleware, getTicketById);

// Update & Delete
ticketRouter.put("/:ticketId", authMiddleware, updateTicket);
ticketRouter.delete("/delete/:ticketId", authMiddleware, deleteTicket);

// Payment verification — no auth needed, Stripe session ID is secure proof of payment
ticketRouter.post("/verify-payment/:sessionId", verifyPayment);

export default ticketRouter;
