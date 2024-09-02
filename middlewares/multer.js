import multer from 'multer';
import { v4 as uuid } from 'uuid';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (file.fieldname === 'coverImage') {
      cb(null, './uploads/covers');
    } else if (file.fieldname === 'ebookPdf') {
      cb(null, './uploads/ebooks');
    } else if (file.fieldname === 'notePdf') {
      cb(null, './uploads/notes');
    } else {
      cb(null, './uploads');
    }
  },
  filename(req, file, cb) {
    const id = uuid();
    const extName = file.originalname.split('.').pop();
    const fileName = `${id}.${extName}`;
    cb(null, fileName);
  },
});

// Middleware for handling eBook uploads
export const uploadEbookFiles = multer({ storage }).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'ebookPdf', maxCount: 1 },
]);

// Middleware for handling notes uploads
export const uploadNoteFiles = multer({ storage }).fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'notePdf', maxCount: 1 },
]);

// Middleware for handling single file uploads for other cases
export const uploadFiles = multer({ storage }).single('file');
