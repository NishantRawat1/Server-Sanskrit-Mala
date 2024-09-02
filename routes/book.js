import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { getAllbooks, getMyBooks, getSinglebook, orderCheckout, paymentVerification } from '../controllers/book.js';
const router=express.Router();

router.get("/book/all",getAllbooks);
router.get("/book/:id",getSinglebook);
router.get("/mybook",isAuth,getMyBooks);
router.post("/book/checkout/:id",isAuth, orderCheckout);
router.post("/bookverification/:id",isAuth,paymentVerification);

export default router; 