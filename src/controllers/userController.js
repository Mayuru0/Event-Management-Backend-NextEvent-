import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import roles from "../config/constants.js";
import generateToken from "../utils/generateToken.js";

// Register user
export const registerUser = async (req, res) => {
  const { 
    name,
    nic, 
    gender,
    email, 
    address,
    PostalCode,
    password,
    contactNumber,
    role, 
    status,
    
  } = req.body;

  try {
    // Check if user already exists (Using email)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash the password
    const hashPassword = await bcrypt.hash(password, 10);

    // Role validation
    let assignedRole = roles.customer; // Default role is 'customer'

    if (email === "admin@gmail.com") {
      assignedRole = roles.admin; // Only 'admin@gmail.com' can be an admin
    } else if (role === roles.organizer || role === roles.customer) {
      assignedRole = role; // Allow only 'organizer' or 'customer' roles from input
    }

    // Create a new user
    const newUser = await User.create({
      name,
      nic, 
      gender,
      email, 
      
      contactNumber,
      address,
      PostalCode,
      profilePic: req.file ? req.file.path : null,
      password: hashPassword,
      role: assignedRole, // Assign validated role
      status,
      createdAt
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: newUser,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error registering user",
      error: error.message,
    });
  }
};


// Login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Compare the password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate JWT Token
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.full_name, role: user.role },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    const { password: removePassword, isDeleted, ...others } = user._doc;
    return res.status(200).json({ message: "Login successful", user: others, token });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get all users
export const getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};

// Get user by ID
export const getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.UserId).select("-password");
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch user",
      error: error.message,
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.UserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Update fields if provided in the request
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.nic = req.body.nic || user.nic;
    user.gender = req.body.gender || user.gender;
    user.contactNumber = req.body.contactNumber || user.contactNumber;
    user.address = req.body.address || user.address;
    user.PostalCode = req.body.PostalCode || user.PostalCode;
    user.profilePic = req.file ? req.file.path : user.profilePic; // Update profile picture if uploaded
    user.status=req.body.status ||user.status;


    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        nic: updatedUser.nic,
        gender: updatedUser.gender,
        address: updatedUser.address,
        PostalCode: updatedUser.PostalCode,
        contactNumber: updatedUser.contactNumber,
        profilePic: updatedUser.profilePic,
        role: updatedUser.role,
        token: generateToken(updatedUser._id), // Generate new token
        status:updatedUser.status

      },
      message: "User updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

//only update status
export const updateUserStatus = async (req, res, next) => {
  try {
    //console.log("Received request to update status:", req.body);  // Log request body
    const user = await User.findById(req.params.UserId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.status = req.body.status || user.status;
    const updatedUser = await user.save();

    res.status(200).json({
      success: true,
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        status: updatedUser.status
      },
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user status:", error);  // Log error
    next(error);
  }
};




// Delete user
export const deleteUser = async (req, res) => {
  const { userId } = req.params; 

  try {
    const deletedUser = await User.findByIdAndDelete(userId);
  
    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      data: deletedUser,
      message: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete user",
      error: error.message,
    });
  }
};
