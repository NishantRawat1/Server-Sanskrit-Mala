import { Notes } from "../models/Notes.js";
import { User } from "../models/User.js";
import { instance } from '../index.js';
import TryCatch from '../middlewares/TryCatch.js';
import crypto from 'crypto'; // Ensure you import crypto
import { NotesPayment } from "../models/NotesPayment.js";


export const getAllNotes = async (req, res) => {
    try {
      // Fetch all notes from the database
      const notes = await Notes.find();
  
      // Send a successful response with the list of notes
      return res.status(200).json({ notes });
    } catch (error) {
      // Handle any errors that occur during the process
      res.status(500).json({
        message: "Error retrieving notes",
        error: error.message
      });
    }
  };

  export const getSingleNote = async (req, res) => {
    try {
      // Find a single note by its ID
      const note = await Notes.findById(req.params.id);
  
      // Check if the note exists
      if (!note) {
        return res.status(404).json({ message: 'Note not found' });
      }
  
      // Send a successful response with the note details
      return res.status(200).json({ note });
    } catch (error) {
      // Handle any errors that occur during the process
      res.status(500).json({
        message: "Error retrieving note",
        error: error.message
      });
    }
  };



export const getMyNotes = async (req, res) => {
  try {
    // Find the user by their ID
    const user = await User.findById(req.user.id).populate('purchasedNotes');

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Retrieve the notes the user has purchased
    const notes = user.purchasedNotes;

    // Send a successful response with the list of notes
    res.status(200).json({ notes });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({
      message: 'Error retrieving notes',
      error: error.message
    });
  }
};



export const getNotePdf = async (req, res) => {
  try {
    // Find the user by their ID
    const user = await User.findById(req.user.id);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has purchased the note
    if (!user.purchasedNotes.includes(req.params.id)) {
      return res.status(403).json({ message: "You have not purchased this note" });
    }

    // Find the note by its ID
    const note = await Notes.findById(req.params.id);

    // Check if the note exists
    if (!note) {
      return res.status(404).json({ message: "Note not found" });
    }

    // Send a successful response with the PDF path
    res.status(200).json({ pdfPath: note.notePdf });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({
      message: "Error retrieving note PDF",
      error: error.message,
    });
  }
};


export const noteCheckout = TryCatch(async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      const note = await Notes.findById(req.params.id);
  
      if (!note) {
        return res.status(404).json({
          message: "Note not found",
        });
      }
  
      if (user.purchasedNotes.includes(note._id)) {
        return res.status(400).json({
          message: "You already own this note",
        });
      }
  
      // Create order with Razorpay
      const options = {
        amount: Number(note.price * 100), // Convert price to paise
        currency: "INR",
        receipt: `receipt_order_${new Date().getTime()}`
      };
  
      const order = await instance.orders.create(options);
  
      // Respond with order details
      res.status(201).json({
        order,
        note
      });
    } catch (error) {
      res.status(500).json({
        message: "Error creating order",
        error: error.message
      });
    }
  });
  

  export const notesVerification = TryCatch(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
    // Verify the Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
  
    const isAuthentic = expectedSignature === razorpay_signature;
  
    if (isAuthentic) {
      // Record the payment
      await NotesPayment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
  
      // Find the user and note
      const user = await User.findById(req.user._id);
      const note = await Notes.findById(req.params.id);
  
      if (!user || !note) {
        return res.status(404).json({ message: "User or Note not found" });
      }
  
      // Add the note to user's purchased notes
      user.purchasedNotes.push(note._id);
  
      await user.save();
  
      res.status(200).json({
        message: "Note Purchased Successfully",
      });
    } else {
      return res.status(400).json({
        message: "Payment Verification Failed",
      });
    }
  });