import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    razorpay_order_id: { type: String, required: true },
    razorpay_payment_id: { type: String, required: true },
    razorpay_signature: { type: String, required: true },
    note: { type: mongoose.Schema.Types.ObjectId, ref: 'Notes' }, // Optional if linking directly
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Optional if linking directly
}, {
    timestamps: true
});

export const NotesPayment = mongoose.model('NotesPayment', paymentSchema);
