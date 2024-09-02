import express from "express";
import { loginUser, myProfile, register, verifyUser } from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js";
import { addProgress, getYourProgress } from "../controllers/course.js";
import { resetPassword,forgotPassword } from "../controllers/user.js";
const router=express.Router();


router.post('/user/register',register);
router.post('/user/verify',verifyUser);
router.post('/user/login',loginUser);
router.get('/user/me',isAuth ,myProfile)
router.post('/user/progress', isAuth, addProgress);
router.get('/user/progress',isAuth,getYourProgress);
router.post("/user/reset", resetPassword);
router.post("/user/forgot", forgotPassword);
export default router;