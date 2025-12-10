/**
 * CLOUDINARY PDF UPLOAD - SIGNED VERSION
 * This version uses signed uploads which bypass security restrictions
 */

// Backend API route to handle signed uploads
const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = multer({ storage: multer.memoryStorage() });

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('📤 Upload route initialized with Cloudinary SDK');

// @route   POST /api/upload/pdf
// @desc    Upload PDF with signed upload (bypasses 401 errors)
// @access  Public
router.post('/pdf', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Uploading PDF:', req.file.originalname);

    // Upload to Cloudinary using signed upload with AUTHENTICATED type
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'votevoice-uploads',
          resource_type: 'raw', // Use 'raw' for PDFs
          access_type: 'authenticated', // AUTHENTICATED - works with strict mode
          type: 'authenticated', // Upload as authenticated type
          overwrite: true
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });

    console.log('✅ PDF uploaded as AUTHENTICATED type');
    console.log('   Public ID:', result.public_id);
    console.log('   Resource Type:', result.resource_type);
    console.log('   Type:', result.type);
    console.log('   Secure URL:', result.secure_url);

    // For authenticated uploads, the URL format is different
    // /raw/authenticated/s--xxx--/v123456/folder/file
    // We don't need to add fl_attachment since we'll serve through proxy
    const url = result.secure_url;

    console.log('✅ PDF uploaded successfully:', url);

    res.json({
      url: url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      type: result.type,
      success: true
    });

  } catch (error) {
    console.error('PDF upload error:', error);
    res.status(500).json({ 
      error: 'Upload failed',
      message: error.message 
    });
  }
});

module.exports = router;
