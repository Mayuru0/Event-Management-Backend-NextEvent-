import mongoose from "mongoose";

const TicketSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  organizerId:{type:String,required:true},
  name: { type: String, required: true },
  profilePic: { type: String, required: true },
  event_title: { type: String, required: true },
  location: { type: String, required: true },
  event_type: { type: String, required: true },
  date: { type: Date, required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  status: { type: String, enum: ["pending", "confirmed", "cancelled"], default: "pending" },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Ticket = mongoose.model("Ticket", TicketSchema);

export default Ticket;
