import express from 'express'
import { isAdmin, isAuth } from '../middlewares/isAuth.js';
import { addLectures, createBook, createCourse, createEbook, createNotes, deleteBook, deleteCourse, deleteEbook, deleteLecture, deleteNote, getAllstats, updateBook, updateEbook, updateNote } from '../controllers/admin.js';
import { uploadFiles,uploadEbookFiles, uploadNoteFiles } from '../middlewares/multer.js';
import { updateRole } from '../controllers/admin.js';
import { getAllUser } from '../controllers/admin.js';


const router=express.Router();
router.post('/course/new',isAuth, isAdmin, uploadFiles ,createCourse)
router.post('/course/:id',isAuth, isAdmin,uploadFiles,addLectures)
router.delete('/lecture/:id',isAuth, isAdmin,deleteLecture)
router.delete('/course/:id',isAuth,isAdmin,deleteCourse)
router.get('/stats',isAuth,isAdmin,getAllstats)
router.put("/user/:id", isAuth, updateRole);
router.get("/users", isAuth, isAdmin, getAllUser);
router.post('/book/new',isAuth,isAdmin,uploadFiles,createBook)
router.delete('/book/:id',isAuth,isAdmin,deleteBook)
router.put('/book/:id', isAuth,isAdmin,uploadFiles, updateBook);
router.post('/ebook/new',isAuth, isAdmin, uploadEbookFiles ,createEbook);
router.delete('/ebook/:id',isAuth,isAdmin,deleteEbook)
router.put('/ebook/:id', isAuth,isAdmin,uploadEbookFiles, updateEbook);
router.post('/notes/new',isAuth, isAdmin, uploadNoteFiles ,createNotes);
router.delete('/notes/:id',isAuth,isAdmin,deleteNote);
router.put('/notes/:id', isAuth,isAdmin,uploadNoteFiles, updateNote);




export default router; 