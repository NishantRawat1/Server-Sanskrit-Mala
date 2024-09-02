import express from 'express'
import { checkout, fetchLecture, fetchLectures, getAllcourses, getMyCourses, getSinglecourse, paymentVerification } from '../controllers/course.js';
import {isAuth} from "../middlewares/isAuth.js"
const router=express.Router();

router.get("/course/all",getAllcourses);
router.get("/course/:id",getSinglecourse);
router.get("/lectures/:id",isAuth, fetchLectures);
router.get("/lecture/:id",isAuth, fetchLecture);
router.get("/mycourse",isAuth,getMyCourses);
router.post("/course/checkout/:id",isAuth, checkout);
router.post("/verification/:id",isAuth,paymentVerification);
export default router; 