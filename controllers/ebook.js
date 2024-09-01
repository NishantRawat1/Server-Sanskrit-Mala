import { Ebooks } from '../models/Ebooks.js'; 
import { User } from '../models/User.js'; 
import { instance } from '../index.js';
import crypto from 'crypto';

import { EbookPayment } from '../models/EbookPayment.js'; // Adjust the path as necessary
import TryCatch from '../middlewares/TryCatch.js'; // Adjust the path as necessary


export const getAllEbooks = async (req, res) => {
    try {
        // Fetch all eBooks from the database
        const ebooks = await Ebooks.find();
        
        // Send a successful response with the list of eBooks
       return res.status(200).json({ ebooks });
    } catch (error) {
        // Handle any errors that occur during the process
        res.status(500).json({
            message: "Error retrieving eBooks",
            error: error.message
        });
    }
};

export const getSingleEbook = async (req, res) => {
    try {
        // Find a single eBook by its ID
        const ebook = await Ebooks.findById(req.params.id);
        
        // Check if eBook exists
        if (!ebook) {
            return res.status(404).json({ message: 'E-book not found' });
        }
        
        // Send a successful response with the eBook details
        return res.status(200).json({ebook} );
    } catch (error) {
        // Handle any errors that occur during the process
        res.status(500).json({
            message: "Error retrieving eBook",
            error: error.message
        });
    }
};



export const getMyEbooks = async (req, res) => {
    try {
        // Find the user by their ID
        const user = await User.findById(req.user.id).populate('purchasedEbooks');
        
        // Check if the user exists
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        // Retrieve the eBooks the user has purchased
        const ebooks = user.purchasedEbooks;
        
        // Send a successful response with the list of eBooks
        res.status(200).json({ ebooks });
    } catch (error) {
        // Handle any errors that occur during the process
        res.status(500).json({
            message: 'Error retrieving eBooks',
            error: error.message
        });
    }
};


// server/controllers/ebookController.js



export const getEbookPdf = async (req, res) => {
  try {
    // Find the user by their ID
    const user = await User.findById(req.user.id);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user has purchased the eBook
    if (!user.purchasedEbooks.includes(req.params.id)) {
      return res.status(403).json({ message: "You have not purchased this eBook" });
    }

    // Find the eBook by its ID
    const ebook = await Ebooks.findById(req.params.id);

    // Check if the eBook exists
    if (!ebook) {
      return res.status(404).json({ message: "eBook not found" });
    }

    // Send a successful response with the PDF path
    res.status(200).json({ pdfPath: ebook.ebookPdf });
  } catch (error) {
    // Handle any errors that occur during the process
    res.status(500).json({
      message: "Error retrieving eBook PDF",
      error: error.message,
    });
  }
};



export const ebookCheckout = TryCatch(async (req, res) => {
    try{
    const user = await User.findById(req.user._id);
    const ebook = await Ebooks.findById(req.params.id);

    if (!ebook) {
        return res.status(404).json({
            message: "E-book not found",
        });
    }

    if (user.purchasedEbooks.includes(ebook._id)) {
        return res.status(400).json({
            message: "You already own this e-book",
        });
    }

    // Create order with Razorpay
    const options = {
        amount: Number(ebook.price * 100), // Convert price to paise
        currency: "INR",
        receipt: `receipt_order_${new Date().getTime()}`
    };

    
        const order = await instance.orders.create(options);

        // Respond with order details
        res.status(201).json({
            order,
            ebook
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating order",
            error: error.message
        });
    }
});



export const ebookVerification = TryCatch(async (req, res) => {
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
        await EbookPayment.create({
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        });

        // Find the user and eBook
        const user = await User.findById(req.user._id);
        const ebook = await Ebooks.findById(req.params.id);

        if (!user || !ebook) {
            return res.status(404).json({ message: "User or eBook not found" });
        }

        // Add the eBook to user's purchased eBooks
        user.purchasedEbooks.push(ebook._id);

        await user.save();

        res.status(200).json({
            message: "eBook Purchased Successfully",
        });
    } else {
        return res.status(400).json({
            message: "Payment Failed",
        });
    }
});



