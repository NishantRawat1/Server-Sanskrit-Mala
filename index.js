import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./database/db.js";
import Razorpay from 'razorpay';
import cors from "cors";


//importing routes
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js"
import bookRoutes from "./routes/book.js"
import ebookRoutes from './routes/ebook.js'
import notesRoutes from './routes/notes.js'

dotenv.config();
export const instance= new Razorpay({
    key_id:process.env.RAZORPAY_KEY_ID,
    key_secret:process.env.RAZORPAY_KEY_SECRET
});


const app=express();


app.use(express.json());
app.use(cors());
const port=process.env.PORT||5000;

app.get('/',(req,res)=>{
    res.send('Server is working fine');
})

app.use("/uploads",express.static("uploads"));


app.use("/api",userRoutes);

app.use("/api",courseRoutes);

app.use("/api",adminRoutes);
app.use("/api",bookRoutes);
app.use("/api",ebookRoutes);
app.use("/api",notesRoutes);
app.listen(port,()=>{
    console.log('server is running on 5000');
    connectDb()
})