import Payment from "../models/paymentModel.js";

export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentsByUserId = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPaymentBySessionId = async (req, res) => {
  try {
    const payment = await Payment.findOne({ stripeSessionId: req.params.sessionId });
    if (!payment) return res.status(404).json({ success: false, message: "Payment not found" });
    res.status(200).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
