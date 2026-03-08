import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    stripeSessionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "usd" },
    paymentStatus: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
    },
    paymentMethod: { type: String, default: "card" },
    eventTitle: { type: String },
    customerName: { type: String },
  },
  { timestamps: true }
);

const Payment = mongoose.model("Payment", PaymentSchema);
export default Payment;
