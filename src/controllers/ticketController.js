import Ticket from "../models/ticketModel.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const addTicket = async (req, res) => {
  try {
    const { userId, organizerId, name, profilePic, event_title, location, event_type, date, quantity, totalPrice, status } = req.body;
    const newTicket = await Ticket.create({
      userId, organizerId, name, profilePic, event_title, location, event_type, date, quantity, totalPrice, status
    });
    res.status(201).json({ success: true, message: "Ticket created successfully", data: newTicket });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    const tickets = await Ticket.find();
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTicketsUserId = async (req, res) => {
  const userId = req.params.userId;
  try {
    const tickets = await Ticket.find({ userId });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTicketsorganizerId = async (req, res) => {
  const organizerId = req.params.organizerId;
  try {
    const tickets = await Ticket.find({ organizerId });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Aggregated analytics stats for an organizer
export const getOrganizerStats = async (req, res) => {
  const { organizerId } = req.params;
  try {
    const tickets = await Ticket.find({ organizerId });
    const confirmedTickets = tickets.filter(t => t.status === "confirmed");

    const totalTicketsSold = confirmedTickets.reduce((sum, t) => sum + t.quantity, 0);
    const totalRevenue = confirmedTickets.reduce((sum, t) => sum + t.totalPrice, 0);

    const currentYear = new Date().getFullYear();
    const monthlyRevenue = Array(12).fill(0);
    const lastYearRevenue = Array(12).fill(0);

    confirmedTickets.forEach(ticket => {
      const date = new Date(ticket.timestamp);
      const year = date.getFullYear();
      const month = date.getMonth();
      if (year === currentYear) {
        monthlyRevenue[month] += ticket.totalPrice;
      } else if (year === currentYear - 1) {
        lastYearRevenue[month] += ticket.totalPrice;
      }
    });

    res.status(200).json({
      success: true,
      data: {
        totalTicketsSold,
        totalRevenue,
        monthlyRevenue,
        lastYearRevenue,
        totalPurchases: tickets.length,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.ticketId);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });
    ticket.name = req.body.name || ticket.name;
    ticket.event_title = req.body.event_title || ticket.event_title;
    ticket.profilePic = req.body.profilePic || ticket.profilePic;
    ticket.location = req.body.location || ticket.location;
    ticket.event_type = req.body.event_type || ticket.event_type;
    ticket.date = req.body.date || ticket.date;
    ticket.quantity = req.body.quantity || ticket.quantity;
    ticket.totalPrice = req.body.totalPrice || ticket.totalPrice;
    ticket.status = req.body.status || ticket.status;
    const updatedTicket = await ticket.save();
    res.status(200).json(updatedTicket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const deletedTicket = await Ticket.findByIdAndDelete(ticketId);
    if (!deletedTicket) return res.status(404).json({ message: "Ticket not found" });
    res.status(200).json({ message: "Ticket deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { title, ticket_price, quantity, userId, ticketId } = req.body;
    if (!title || !ticket_price || !quantity || !userId || !ticketId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const lineItems = [{
      price_data: {
        currency: "usd",
        product_data: { name: title },
        unit_amount: ticket_price * 100,
      },
      quantity,
    }];
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: { userId, ticketId },
    });
    res.json({ url: session.url });
  } catch (err) {
    console.error("Error creating checkout session", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};
