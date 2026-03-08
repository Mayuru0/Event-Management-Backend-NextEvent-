import express from "express";
import {
  deleteUser,
  getUser,
  getUsers,
  loginUser,
  logoutUser,
  refreshAccessToken,
  registerUser,
  updateUserProfile,
  updateUserStatus,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../utils/cloudinary.js";

const userRoute = express.Router();

// Auth routes (public)
userRoute.post("/register", upload.single("profilePic"), registerUser);
userRoute.post("/login", loginUser);
userRoute.post("/refresh", refreshAccessToken);
userRoute.post("/logout", logoutUser);

// Protected routes
userRoute.get("/get", authMiddleware, getUsers);
userRoute.get("/:UserId", authMiddleware, getUser);

userRoute.put("/update/:UserId", authMiddleware, upload.single("profilePic"), updateUserProfile);
userRoute.patch("/update/status/:UserId", authMiddleware, updateUserStatus);

// Delete route
userRoute.delete("/delete/:UserId", authMiddleware, deleteUser);

export default userRoute;
