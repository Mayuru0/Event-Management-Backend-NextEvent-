import bcrypt from "bcrypt";
import User from "../models/userModel.js";
import roles from "../config/constants.js";
import generateToken from "../utils/generateToken.js";
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/jwt.js";

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
    createdAt
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
   
    if (!req.file) {
  return res.status(400).json({
    success: false,
    message: "Profile picture is required",
  });
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
      role: assignedRole,
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

    const tokenPayload = { id: user._id, email: user.email, name: user.name, role: user.role };

    // Generate short-lived access token (15 minutes)
    const accessToken = generateAccessToken(tokenPayload);

    // Generate long-lived refresh token (7 days)
    const refreshToken = generateRefreshToken({ id: user._id });

    // Store refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    const { password: removePassword, isDeleted, refreshToken: removeRefresh, ...others } = user._doc;

    return res.status(200).json({
      message: "Login successful",
      user: others,
      token: accessToken,
      refreshToken,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Refresh access token
export const refreshAccessToken = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ success: false, message: "Refresh token required" });
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    return res.status(403).json({ success: false, message: "Invalid or expired refresh token" });
  }

  try {
    const user = await User.findById(decoded.id);
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(403).json({ success: false, message: "Refresh token mismatch" });
    }

    const tokenPayload = { id: user._id, email: user.email, name: user.name, role: user.role };
    const newAccessToken = generateAccessToken(tokenPayload);

    return res.status(200).json({
      success: true,
      token: newAccessToken,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Logout — clear refresh token
export const logoutUser = async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ success: false, message: "Refresh token required" });
  }

  try {
    await User.findOneAndUpdate({ refreshToken }, { refreshToken: null });
    return res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (err) {
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
    const user = await User.findById(req.params.UserId).select("-password -refreshToken");
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
    user.profilePic = req.file ? req.file.path : user.profilePic;
    user.status = req.body.status || user.status;

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    // Issue a new access token with updated user info
    const tokenPayload = { id: updatedUser._id, email: updatedUser.email, name: updatedUser.name, role: updatedUser.role };
    const newAccessToken = generateAccessToken(tokenPayload);

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
        status: updatedUser.status,
        isVerified: updatedUser.isVerified,
        token: newAccessToken,
      },
      message: "User updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Only update status
export const updateUserStatus = async (req, res, next) => {
  try {
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
    console.error("Error updating user status:", error);
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
