const express = require('express');
const router = express.Router();
const cloudinary = require('cloudinary').v2;
const axios = require('axios');

// Configure Cloudinary SDK
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

console.log('📄 Documents route initialized with Cloudinary SDK');

// @route   GET /api/documents/view/*
// @desc    Proxy PDF viewing with signed URL
// @access  Public
router.get('/view/*', async (req, res) => {
  try {
    const publicId = req.params[0];
    
    console.log('📄 PDF View Request:', publicId);
    
    // Generate authenticated URL using Cloudinary SDK
    // This works for files uploaded with type: 'authenticated'
    const authenticatedUrl = cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'authenticated', // Match the upload type
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
    });
    
    console.log('✅ Generated AUTHENTICATED signed URL');
    console.log('   Fetching from Cloudinary...');
    
    try {
      // Fetch using authenticated URL
      const response = await axios({
        method: 'get',
        url: authenticatedUrl,
        responseType: 'stream',
        timeout: 10000
      });
      
      console.log('✅ Got PDF, streaming to client');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      response.data.pipe(res);
      
    } catch (authError) {
      // If authenticated fails, try as regular upload type
      console.log('❌ Authenticated failed, trying regular upload type...');
      
      const regularUrl = cloudinary.url(publicId, {
        resource_type: 'raw',
        type: 'upload',
        sign_url: true,
        secure: true
      });
      
      const response = await axios({
        method: 'get',
        url: regularUrl,
        responseType: 'stream',
        timeout: 10000
      });
      
      console.log('✅ Got PDF as regular upload, streaming to client');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      
      response.data.pipe(res);
    }
    
  } catch (error) {
    console.error('❌ Error fetching PDF:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Status Text:', error.response.statusText);
    }
    res.status(500).json({ 
      error: 'Failed to fetch PDF', 
      message: error.message 
    });
  }
});

// @route   GET /api/documents/download/*
// @desc    Download PDF with signed URL
// @access  Public
router.get('/download/*', async (req, res) => {
  try {
    const publicId = req.params[0];
    const filename = req.query.filename || 'document.pdf';
    
    console.log('📥 PDF Download Request:', publicId);
    console.log('   Filename:', filename);
    
    // Generate authenticated URL using Cloudinary SDK
    // Try authenticated type first (for new PDFs)
    const authenticatedUrl = cloudinary.url(publicId, {
      resource_type: 'raw',
      type: 'authenticated',
      sign_url: true,
      secure: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour expiry
    });
    
    console.log('✅ Generated AUTHENTICATED signed download URL');
    console.log('   Fetching from Cloudinary...');
    
    try {
      // Fetch using authenticated URL
      const response = await axios({
        method: 'get',
        url: authenticatedUrl,
        responseType: 'stream',
        timeout: 10000
      });
      
      console.log('✅ Got PDF, streaming download to client');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      response.data.pipe(res);
      
    } catch (authError) {
      // If authenticated fails, try as regular upload type
      console.log('❌ Authenticated failed, trying regular upload type...');
      
      const regularUrl = cloudinary.url(publicId, {
        resource_type: 'raw',
        type: 'upload',
        sign_url: true,
        secure: true
      });
      
      const response = await axios({
        method: 'get',
        url: regularUrl,
        responseType: 'stream',
        timeout: 10000
      });
      
      console.log('✅ Got PDF as regular upload, streaming download to client');
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Access-Control-Allow-Origin', '*');
      
      response.data.pipe(res);
    }
    
  } catch (error) {
    console.error('❌ Error downloading PDF:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Status Text:', error.response.statusText);
    }
    res.status(500).json({ 
      error: 'Failed to download PDF', 
      message: error.message 
    });
  }
});

module.exports = router;
