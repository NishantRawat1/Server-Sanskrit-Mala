import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book', // Reference to the Book model
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
  },
  address: {
    type: String,
    required: true, // Delivery address is required
  },
  paymentId: {
    type: String,
    required: true, // Razorpay payment ID
  },
  amount: {
    type: Number,
    required: true, // Amount of the order
  },
  status: {
    type: String,
    default: 'Pending', // Order status
    enum: ['Pending', 'Completed', 'Cancelled'], // Possible statuses
  },
  createdAt: {
    type: Date,
    default: Date.now, // Default to current date
  },
});

export const Order = mongoose.model('Order', orderSchema);


