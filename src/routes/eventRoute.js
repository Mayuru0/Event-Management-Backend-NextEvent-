import express from "express";
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getEventsByOrganizerid,
} from "../controllers/eventController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
//import upload from "../utils/multerConfig.js"; 
import { upload } from "../utils/cloudinary.js";
const eventRouter = express.Router();

// Create a new event
eventRouter.post("/create", authMiddleware,upload.single("image"),createEvent);

// Get all events
eventRouter.get("/get", getEvents);


//GET ALL ORGANIZER EVENTS
eventRouter.get("/:organizerid",authMiddleware,getEventsByOrganizerid);

// Get a single event by ID
eventRouter.get("/get/:eventId", getEventById);

// Update an event
eventRouter.put("/update/:eventId",authMiddleware,upload.single("image"), updateEvent);

// Delete an event
eventRouter.delete("/delete/:eventId",authMiddleware, deleteEvent);

export default eventRouter;