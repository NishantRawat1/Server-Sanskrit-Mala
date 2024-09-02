import express from 'express';
import { isAuth } from '../middlewares/isAuth.js';
import { getAllNotes, getMyNotes, getNotePdf, getSingleNote, noteCheckout, notesVerification } from '../controllers/notes.js';


const router = express.Router();

router.get('/notes/all', getAllNotes);
router.get('/notes/:id',getSingleNote);
router.get('/mynotes',isAuth,getMyNotes);
router.get("/notes/:id/pdf", isAuth, getNotePdf);
router.post("/notes/checkout/:id",isAuth, noteCheckout);
router.post("/notesverification/:id",isAuth,notesVerification);

export default router;
