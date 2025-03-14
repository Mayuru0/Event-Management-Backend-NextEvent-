import express from "express";
import { deleteUser, getUser, getUsers, loginUser, registerUser, updateUserProfile, updateUserStatus } from "../controllers/userController.js";
//import upload from "../utils/multerConfig.js"; 
import authMiddleware from "../middlewares/authMiddleware.js";
import { upload } from "../utils/cloudinary.js";
const userRoute = express.Router();

//post routes
userRoute.post("/register", upload.single("profilePic"), registerUser);
userRoute.post("/login", loginUser);

//get routes
userRoute.get("/get", authMiddleware, getUsers);


userRoute.get("/:UserId", authMiddleware, getUser);
//organizerRoute.get("/profile", authMiddleware, getOrganizer);


userRoute.put("/update/:UserId",authMiddleware,  upload.single("profilePic"), updateUserProfile);


userRoute.patch("/update/status/:UserId" ,authMiddleware,updateUserStatus);

//delete route
userRoute.delete("/delete/:UserId",authMiddleware, deleteUser);



export default userRoute;