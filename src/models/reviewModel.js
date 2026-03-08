import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name:       { type: String, required: true },
  profilePic: { type: String, default: null },
  role:       { type: String, enum: ["customer", "organizer", "admin"], required: true },
  stars:      { type: Number, min: 1, max: 5, required: true },
  comment:    { type: String, required: true, minlength: 10, maxlength: 500 },
  timestamp:  { type: Date, default: Date.now },
});

const Review = mongoose.model("Review", ReviewSchema);

export default Review;
