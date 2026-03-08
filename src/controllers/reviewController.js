import Review from "../models/reviewModel.js";
import User from "../models/userModel.js";

// Create a review — logged-in users only
export const createReview = async (req, res) => {
  const { stars, comment } = req.body;
  const userId = req.user?.id || req.user?._id;

  if (!stars || !comment) {
    return res.status(400).json({ message: "Stars and comment are required" });
  }

  if (stars < 1 || stars > 5) {
    return res.status(400).json({ message: "Stars must be between 1 and 5" });
  }

  if (comment.trim().length < 10) {
    return res.status(400).json({ message: "Comment must be at least 10 characters" });
  }

  try {
    // Look up the authenticated user for their name, profilePic and role
    const user = await User.findById(userId).select("name profilePic role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prevent duplicate reviews from the same user
    const existing = await Review.findOne({ userId });
    if (existing) {
      return res.status(409).json({ message: "You have already submitted a review. Please delete your existing review first." });
    }

    const review = await Review.create({
      userId,
      name:       user.name,
      profilePic: user.profilePic || null,
      role:       user.role,
      stars:      Number(stars),
      comment:    comment.trim(),
    });

    res.status(201).json({ success: true, message: "Review submitted successfully", data: review });
  } catch (error) {
    res.status(500).json({ message: "Error creating review", error: error.message });
  }
};

// Get all reviews — public
export const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ timestamp: -1 });
    res.status(200).json({ success: true, data: reviews });
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
};

// Delete a review — auth required (own review or admin)
export const deleteReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user?.id || req.user?._id;

  try {
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // Allow deletion only by the owner
    if (review.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to delete this review" });
    }

    await Review.findByIdAndDelete(reviewId);
    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting review", error: error.message });
  }
};
