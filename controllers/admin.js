import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { Book } from "../models/Books.js";
import {rm} from "fs";
import {promisify} from 'util';
import {User} from "../models/User.js";
import {Ebooks} from '../models/Ebooks.js'
import { Notes } from "../models/Notes.js";
import fs from "fs";
import TryCatch from "../middlewares/TryCatch.js"

export const createCourse= async(req,res)=>{
    try{
        const{title,description,category,createdBy,duration,price}=req.body

        const image=req.file;

        await Courses.create({
            title,
            description,
            category,
            createdBy,
            duration,
            price,
            image:image?.path,
        });

        res.status(201).json({
            message:"Course created successfully",
        })
        
    }
    catch(error){
        res.status(500).json({
            message:error.message

        })
        
    }
}

export const addLectures=async(req,res)=>{
    try{
        const course=await Courses.findById(req.params.id)

        if(!course) return res.status(404).json({
            message:"Course not found"
        })

        const {title,description}=req.body
        const file=req.file
        const lecture= await Lecture.create({
            title,
            description,
            video:file?.path,
            course:course._id
        })

        res.status(201).json({
            message:"Lecture added successfully",
            lecture,
        })
    }
    catch(error){
        res.status(500).json({
            message:error.message
        })
    }
}


export const deleteLecture=async(req,res)=>{
    try{
       const lecture=await Lecture.findById(req.params.id);
       rm(lecture.video,()=>{
        console.log("Video Deleted");
       });

       await lecture.deleteOne();
       res.status(200).json({
        message:"Lecture deleted successfully"
        })
    }
    catch(error){
        res.status(500).json({
            message:error.message
        })
    }
}

const unlinkAsync= promisify(fs.unlink)
export const deleteCourse=async(req,res)=>{
    try{
       const course=await Courses.findById(req.params.id);
       const lectures=await Lecture.find({course:course._id})
       await Promise.all(
        lectures.map(async(lecture)=>{
            await unlinkAsync(lecture.video);
            console.log("video deleted");

        })
        
       )
       rm(course.image,()=>{
        console.log("Image Deleted");
       });

       await Lecture.find({course:req.params.id}).deleteMany()
       await course.deleteOne();

       await User.updateMany({},{$pull:{subscription:req.params.id}});
       res.status(200).json({
        message:"Course deleted successfully"
        })

    }
    catch(error){
        res.status(500).json({
            message:error.message
        })
    }
}


export const createBook = async (req, res) => {
    
  
    try {
        const { title, author, price, description } = req.body;
    const image = req.file ;
    
    await Book.create({
        title,
        author,
        price,
        description,
        image:image?.path,
    });
    res.status(201).json({ message: "Book created successfully" });
      
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };

export const deleteBook=async(req,res)=>{
    try{
        const book=await Book.findByIdAndDelete(req.params.id);
        if (!book) return res.status(404).json({ message: "Book not found" });
        rm(book.image,()=>{
            console.log(" Book Image Deleted");
           });
           res.json({ message: "Book deleted successfully" });
    }
    catch(error){
        res.status(500).json({
            message:error.message
            })
    }

}

  
export const getAllstats = async(req,res)=>{
    try{

        const totalCourses=(await Courses.find()).length;
        const totalBooks=(await Book.find()).length;
        const totalUser=(await User.find()).length;
        const totalEbooks=(await Ebooks.find()).length;
        const totalNotes=(await Notes.find()).length;
       

        const stats={
            totalCourses,
            totalBooks,
            totalUser,
            totalEbooks,
            totalNotes
          
        }

        res.json({
            stats
        })

    }
    catch(error){
        res.status(500).json({
            message:error.message
            })
    }
}

export const getAllUser = TryCatch(async (req, res) => {
    const users = await User.find({ _id: { $ne: req.user._id } }).select(
      "-password"
    );
    res.json({ users });
});

export const updateRole = TryCatch(async (req, res) => {
    if (req.user.mainrole !== "superadmin")
      return res.status(403).json({
        message: "This endpoint is assign to superadmin",
      });
    const user = await User.findById(req.params.id);
  
    if (user.role === "user") {
      user.role = "admin";
      await user.save();
  
      return res.status(200).json({
        message: "Role updated to admin",
      });
    }
  
    if (user.role === "admin") {
      user.role = "user";
      await user.save();
  
      return res.status(200).json({
        message: "Role updated",
      });
    }
  });

  export const updateBook = async (req, res) => {
    const { title, author, price, description } = req.body;
    const { id } = req.params;
    
    try {
      const book = await Book.findById(id);
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      
      // Update book details
      book.title = title || book.title;
      book.author = author || book.author;
      book.price = price || book.price;
      book.description = description || book.description;
  
      // Handle file upload if new image is provided
      if (req.file) {
        book.image = req.file.path;
      }
  
      await book.save();
      
      res.status(200).json({ message: "Book updated successfully", book });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  };

  export const createEbook = async (req, res) => {
    
  
    try {
        const { title, author, price, description } = req.body;
  
    
    await Ebooks.create({
        title,
        author,
        price,
        description,
        coverImage:req.files.coverImage[0].path,
        ebookPdf:req.files.ebookPdf[0].path
    });
    res.status(201).json({ message: "EBook created successfully" });
      
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };



  export const deleteEbook = async (req, res) => {
    try {
      // Find the eBook by ID
      const ebook = await Ebooks.findById(req.params.id);
  
      if (!ebook) {
        return res.status(404).json({ message: 'E-book not found' });
      }
  
      // Delete the eBook PDF file
      if (ebook.ebookPdf) {
        await unlinkAsync(ebook.ebookPdf);
        console.log('E-book PDF deleted');
      }
  
      // Delete the cover image file
      if (ebook.coverImage) {
        await unlinkAsync(ebook.coverImage);
        console.log('Cover image deleted');
      }
  
      // Remove the eBook record from the database
      await ebook.deleteOne();
  
      // Optionally update any related records
      // Example: Remove the eBook from user subscriptions (if applicable)
      await User.updateMany({}, { $pull: { purchasedEbooks: req.params.id } });
  
      res.status(200).json({
        message: 'E-book deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting eBook:', error);
      res.status(500).json({ message: error.message });
    }
  };

  

export const updateEbook = TryCatch(async (req, res) => {
    const { title, author, price, description } = req.body;
    const ebookId = req.params.id;

    // Find the eBook to update
    const ebook = await Ebooks.findById(ebookId);
    if (!ebook) {
        return res.status(404).json({ message: 'eBook not found' });
    }

    // Handle file uploads
    if (req.file) {
        // If a new cover image is uploaded, delete the old one
        if (ebook.coverImage) {
            await unlinkAsync(ebook.coverImage); // Remove old cover image
        }
        
        ebook.coverImage=req.files.coverImage[0].path// Update with new cover image path
    }

    if (req.body.pdf) {
        // If a new PDF is uploaded, delete the old one
        if (ebook.ebookPdf) {
            await unlinkAsync(ebook.ebookPdf); // Remove old PDF
        }
         
        
        ebook.ebookPdf=req.files.ebookPdf[0].path;// Update with new PDF path
    }

    // Update eBook details
    ebook.title = title || ebook.title;
    ebook.author = author || ebook.author;
    ebook.price = price || ebook.price;
    ebook.description = description || ebook.description;

    // Save the updated eBook
    await ebook.save();

    res.status(200).json({ message: 'eBook updated successfully', ebook });
});



export const createNotes = async (req, res) => {
  try {
    const { title, author, price, description } = req.body;

    await Notes.create({
      title,
      price,
      description,
      coverImage: req.files.coverImage[0].path,
      notePdf: req.files.notePdf[0].path
    });

    res.status(201).json({ message: "Note created successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


export const deleteNote = async (req, res) => {
  try {
    // Find the note by ID
    const note = await Notes.findById(req.params.id);

    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Delete the note PDF file
    if (note.notePdf) {
      await unlinkAsync(note.notePdf);
      console.log('Note PDF deleted');
    }

    // Delete the cover image file
    if (note.coverImage) {
      await unlinkAsync(note.coverImage);
      console.log('Cover image deleted');
    }

    // Remove the note record from the database
    await note.deleteOne();

    // Optionally update any related records
    // Example: Remove the note from user subscriptions (if applicable)
    await User.updateMany({}, { $pull: { purchasedNotes: req.params.id } });

    res.status(200).json({
      message: 'Note deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: error.message });
  }
};






// Function to update a note
export const updateNote = TryCatch(async (req, res) => {
    const { title, price, description } = req.body;
    const noteId = req.params.id;

    // Find the note to update
    const note = await Notes.findById(noteId);
    if (!note) {
        return res.status(404).json({ message: 'Note not found' });
    }

    // Handle file uploads
    if (req.files.coverImage) {
        // If a new cover image is uploaded, delete the old one
        if (note.coverImage) {
            await unlinkAsync(note.coverImage); // Remove old cover image
        }
        
        note.coverImage = req.files.coverImage[0].path; // Update with new cover image path
    }

    if (req.files.notePdf) {
        // If a new PDF is uploaded, delete the old one
        if (note.notePdf) {
            await unlinkAsync(note.notePdf); // Remove old PDF
        }
        
        note.notePdf = req.files.notePdf[0].path; // Update with new PDF path
    }

    // Update note details
    note.title = title || note.title;
    note.price = price || note.price;
    note.description = description || note.description;

    // Save the updated note
    await note.save();

    res.status(200).json({ message: 'Note updated successfully', note });
});
