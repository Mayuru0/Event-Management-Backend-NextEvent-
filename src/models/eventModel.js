import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
  organizerid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,

  },
  event_type: {
    type: String,
    required: true,
  },
  ticket_price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },

  location: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  image: {
    type: String, 
    required: true,
  },
  popularity: {
    type: Number,
    default: 0,
  },
  status:{
    type:String,
    enum: ["Pending", "Published", "Archived" ,"Rejected"],
    default: "Pending",
  },
 
}, { timestamps: true }); 


const Event = mongoose.model("Event", eventSchema);

export default Event;