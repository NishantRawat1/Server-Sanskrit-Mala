import { Book } from "../models/Books.js";
import Razorpay from 'razorpay';
import { instance } from "../index.js"
import {Order} from '../models/Order.js';
import TryCatch from "../middlewares/TryCatch.js";
import {User} from '../models/User.js';


export const getAllbooks= async(req,res)=>{
    try{
          const books=await Book.find()
          res.status(200).json({books})
    }
    catch(error){
        res.status(500).json({
            message:"Error"
        })
    }
}


export const getSinglebook= async(req,res)=>{
    try{
         const book= await Book.findById(req.params.id);
         res.status(200).json({book})
    }
    catch(error){
        res.status(500).json({
            message:"Error"
        })
    }
}

export const getMyBooks= async(req,res)=>{
    try{
        const books= await Book.find({_id:req.user.book})

        res.json({
            books
        })
    }
    catch(error){
        res.status(500).json({
            message:"Error"
            })

    }
}


export const orderCheckout = TryCatch(async (req, res) => {
    const user = await User.findById(req.user._id); // Assuming user is authenticated
    const book = await Book.findById(req.params.id); // Assuming book ID is passed as a URL parameter
  
    if (!book) {
      return res.status(404).json({
        message: "Book not found",
      });
    }
  
    const amount = Number(book.price * 100); // Convert price to the smallest currency unit (e.g., cents)
  
    const options = {
      amount, // Amount in the smallest currency unit
      currency: "INR",
    };
  
    const order = await instance.orders.create(options);
  
    // Create a new order in the database
    const newOrder = new Order({
      book: book._id,
      user: user._id,
      address: req.body.address, // Delivery address
      paymentId: order.id,
      amount: book.price, // Store the price (not multiplied by 100)
      status: "Pending",
    });
  
    await newOrder.save();
  
    res.status(201).json({
      order,
      newOrder,
    });
  });

  import crypto from 'crypto';

  
  export const paymentVerification = TryCatch(async (req, res) => {
    const { order_id, payment_id, razorpay_signature } = req.body;
  
    // Retrieve the order from the database
    const order = await Order.findOne({ paymentId: order_id });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
  
    // Generate the signature for verification
    const generatedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                                     .update(order_id + "|" + payment_id)
                                     .digest('hex');
  
    // Verify the signature
    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Invalid signature" });
    }
  
    // Update the order status
    order.status = 'Completed';
    await order.save();
  
    res.json({ message: "Payment verified successfully", order });
  });
  

