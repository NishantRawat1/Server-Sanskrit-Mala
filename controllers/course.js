import { instance } from "../index.js"
import {Courses} from "../models/Courses.js"
import {Lecture} from "../models/Lecture.js"
import { Payment } from "../models/Payment.js"
import {User} from "../models/User.js";
import crypto from "crypto";
import TryCatch from "../middlewares/TryCatch.js"
import { Progress } from "../models/Progress.js"

export const getAllcourses= async(req,res)=>{
    try{
          const courses=await Courses.find()
          res.status(200).json({courses})
    }
    catch(error){
        res.status(500).json({
            message:"Error"
        })
    }
}

export const getSinglecourse= async(req,res)=>{
    try{
         const course= await Courses.findById(req.params.id);
         res.status(200).json({course})
    }
    catch(error){
        res.status(500).json({
            message:"Error"
        })
    }
}


export const fetchLectures= async(req,res)=>{
    try{
         const lectures=await Lecture.find({course:req.params.id})

         const user=await User.findById(req.user._id)

         if (user.role==='admin'){
          return  res.status(200).json({lectures});
         }

         if(!user.subscription.includes(req.params.id)) return res.status(400).json({
            message:"You don't have access to this course"
         });

        return res.json({lectures})
    }
    catch(error){
        res.status(500).json({
            message:"Error"
        })
    }
}


export const fetchLecture= async(req,res)=>{
    try{
         const lecture=await Lecture.findById(req.params.id);

         const user=await User.findById(req.user._id);

         if (user.role==='admin'){
           return  res.json({lecture});
         }

         if(!user.subscription.includes(lecture.course)) return res.status(400).json({
            message:"You don't have access to this course"
         });

         return res.json({lecture});
    }
    catch(error){
        res.status(500).json({
            message:"Error"
        })
    }
}

export const getMyCourses= async(req,res)=>{
    try{
        const courses= await Courses.find({_id:req.user.subscription})

        res.json({
            courses
        })
    }
    catch(error){
        res.status(500).json({
            message:"Error"
            })

    }
}


export const checkout = TryCatch(async (req, res) => {
    const user = await User.findById(req.user._id);
  
    const course = await Courses.findById(req.params.id);
  
    if (user.subscription.includes(course._id)) {
      return res.status(400).json({
        message: "You already have this course",
      });
    }
  
    const options = {
      amount: Number(course.price * 100),
      currency: "INR",
    };
  
    const order = await instance.orders.create(options);
  
    res.status(201).json({
      order,
      course,
    });
  });
  
  export const paymentVerification = TryCatch(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;
  
    const body = razorpay_order_id + "|" + razorpay_payment_id;
  
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");
  
    const isAuthentic = expectedSignature === razorpay_signature;
  
    if (isAuthentic) {
      await Payment.create({
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
      });
  
      const user = await User.findById(req.user._id);
  
      const course = await Courses.findById(req.params.id);
  
      user.subscription.push(course._id);
  
      await Progress.create({
        course: course._id,
        completedLectures: [],
        user: req.user._id,
      });
  
      await user.save();
  
      res.status(200).json({
        message: "Course Purchased Successfully",
      });
    } else {
      return res.status(400).json({
        message: "Payment Failed",
      });
    }
  });
  export const addProgress = TryCatch(async (req, res) => {
    const progress = await Progress.findOne({
      user: req.user._id,
      course: req.query.course,
    });
  
    const { lectureId } = req.query;
  
    if (progress.completedLectures.includes(lectureId)) {
      return res.json({
        message: "Progress recorded",
      });
    }
  
    progress.completedLectures.push(lectureId);
  
    await progress.save();
  
    res.status(201).json({
      message: "new Progress added",
    });
  });
  
  export const getYourProgress = TryCatch(async (req, res) => {
    const progress = await Progress.find({
      user: req.user._id,
      course: req.query.course,
    });
  
    if (!progress) return res.status(404).json({ message: "null" });
  
    const allLectures = (await Lecture.find({ course: req.query.course })).length;
  
    const completedLectures = progress[0].completedLectures.length;
  
    const courseProgressPercentage = (completedLectures * 100) / allLectures;
  
    res.json({
      courseProgressPercentage,
      completedLectures,
      allLectures,
      progress,
    });
  });
