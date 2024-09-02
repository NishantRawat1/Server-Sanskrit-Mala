import express from 'express'
import {   ebookCheckout, ebookVerification, getAllEbooks, getEbookPdf, getMyEbooks, getSingleEbook,} from '../controllers/ebook.js';
import {isAuth} from "../middlewares/isAuth.js"
const router=express.Router();

router.get("/ebook/all",getAllEbooks);
router.get("/ebook/:id",getSingleEbook);

router.get("/myebook",isAuth,getMyEbooks);
router.post("/ebook/checkout/:id",isAuth, ebookCheckout);
router.post("/ebookverification/:id",isAuth,ebookVerification);
router.get("/ebooks/:id/pdf", isAuth, getEbookPdf);
export default router; 