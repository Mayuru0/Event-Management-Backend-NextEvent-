import express from "express";
import { getAllPayments, getPaymentsByUserId, getPaymentBySessionId } from "../controllers/paymentController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const paymentRoute = express.Router();

paymentRoute.get("/get", authMiddleware, getAllPayments);
paymentRoute.get("/user/:userId", authMiddleware, getPaymentsByUserId);
paymentRoute.get("/session/:sessionId", authMiddleware, getPaymentBySessionId);

export default paymentRoute;
