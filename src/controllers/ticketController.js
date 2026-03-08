import Ticket from "../models/ticketModel.js";
import Payment from "../models/paymentModel.js";
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const addTicket = async (req, res) => {
  try {
    const { userId, organizerId, eventId, name, profilePic, event_title, location, event_type, date, quantity, totalPrice, status } = req.body;
    const newTicket = await Ticket.create({
      userId, organizerId, eventId, name, profilePic, event_title, location, event_type, date, quantity, totalPrice, status
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
        unit_amount: Math.round(ticket_price * 100),
      },
      quantity,
    }];
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      metadata: { userId, ticketId },
    });

    await Ticket.findByIdAndUpdate(ticketId, { stripeSessionId: session.id });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Error creating checkout session", err);
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

// Called by the frontend success page — verifies payment with Stripe and saves to DB
export const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ success: false, message: "Session ID is required" });
    }

    // Idempotent — return existing record if already saved
    const existing = await Payment.findOne({ stripeSessionId: sessionId });
    if (existing) {
      console.log("Payment already exists for session:", sessionId);
      return res.status(200).json({ success: true, data: existing });
    }

    // Retrieve session from Stripe
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (stripeErr) {
      console.error("Stripe session retrieve failed:", stripeErr.message);
      return res.status(400).json({ success: false, message: "Invalid Stripe session" });
    }

    console.log("Stripe session payment_status:", session.payment_status);

    if (session.payment_status !== "paid") {
      return res.status(400).json({ success: false, message: "Payment not completed yet" });
    }

    const { ticketId, userId } = session.metadata || {};
    console.log("Metadata — ticketId:", ticketId, "userId:", userId);

    if (!ticketId) {
      return res.status(400).json({ success: false, message: "Ticket ID missing from session metadata" });
    }

    // Confirm the ticket
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status: "confirmed", stripeSessionId: sessionId },
      { new: true }
    );

    if (!updatedTicket) {
      console.error("Ticket not found for ticketId:", ticketId);
      return res.status(404).json({ success: false, message: "Ticket not found" });
    }

    // Save payment record
    const payment = await Payment.create({
      ticketId: updatedTicket._id,
      userId: userId || updatedTicket.userId,
      stripeSessionId: sessionId,
      amount: (session.amount_total || 0) / 100,
      currency: session.currency || "usd",
      paymentStatus: "success",
      paymentMethod: "card",
      eventTitle: updatedTicket.event_title || "",
      customerName: updatedTicket.name || "",
    });

    console.log("Payment saved to DB:", payment._id);
    res.status(201).json({ success: true, data: payment });
  } catch (err) {
    console.error("verifyPayment error:", err.message);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Stripe webhook — confirm payment and update ticket status
export const stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { ticketId, userId } = session.metadata || {};

    if (ticketId) {
      try {
        const updatedTicket = await Ticket.findByIdAndUpdate(
          ticketId,
          { status: "confirmed", stripeSessionId: session.id },
          { new: true }
        );
        console.log(`Ticket ${ticketId} confirmed via Stripe webhook`);

        // Create payment record
        await Payment.create({
          ticketId,
          userId: userId || updatedTicket?.userId,
          stripeSessionId: session.id,
          amount: (session.amount_total || 0) / 100,
          currency: session.currency || "usd",
          paymentStatus: "success",
          paymentMethod: "card",
          eventTitle: updatedTicket?.event_title || "",
          customerName: updatedTicket?.name || "",
        });
      } catch (err) {
        console.error("Failed to update ticket or create payment:", err.message);
      }
    }
  }

  res.json({ received: true });
};
