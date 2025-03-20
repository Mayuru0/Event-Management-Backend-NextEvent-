import mongoose from "mongoose";
import roles from "../config/constants.js";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    nic: {
      type: String,
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    contactNumber: {
      type: String,
      required: true,
    },
    profilePic: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    PostalCode: {
      type: Number,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "organizer", "customer"],
      default: roles?.customer || "customer",
      required: true,
    },
    isLogin: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Middleware to set status to "verified" if the user is a customer
UserSchema.pre("save", function (next) {
  if (this.role === "customer") {
    this.status = "verified";
  }
  next();
});

const User = mongoose.model("User", UserSchema);

export default User;
