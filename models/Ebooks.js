import mongoose from 'mongoose';

const EbookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  price: { type: Number, required: true },
  description: { type: String, required: true },
  ebookPdf: { type: String, required: true },
  coverImage: { type: String, required: true } // New field for cover image
});

export const Ebooks = mongoose.model('Ebooks', EbookSchema);
