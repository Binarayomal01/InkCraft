const path = require('path');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype && file.mimetype.startsWith('image/')) {
    cb(null, true);
    return;
  }

  cb(new Error('Only image uploads are allowed'));
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    const baseName = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9-_]/g, '-');
    return {
      folder: process.env.CLOUDINARY_FOLDER || 'inkcraft/designs',
      resource_type: 'image',
      public_id: `${Date.now()}-${baseName}`
    };
  }
});

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: Number(process.env.MAX_FILE_SIZE || 5000000)
  }
});

module.exports = {
  cloudinary,
  upload
};
