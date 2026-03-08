import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { createReview, deleteReview, getReviews } from "../controllers/reviewController.js";

const reviewRoute = express.Router();

// Create — auth required
reviewRoute.post("/create", authMiddleware, createReview);

// Get all — public
reviewRoute.get("/get", getReviews);

// Delete — auth required (own review)
reviewRoute.delete("/delete/:reviewId", authMiddleware, deleteReview);

export default reviewRoute;
