import mongoose from "mongoose";

const ContactSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true,  },
  contactNumber: { type: String, required: true },
  subject: { type: String, required: true },
  reason: { type: String, required: true },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Contact = mongoose.model("Contact", ContactSchema);

export default Contact;
