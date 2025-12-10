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
    let publicId = req.params[0];
    
    console.log('📄 PDF View Request:', publicId);
    
    // Normalize the public ID - remove file extension if present
    if (publicId.endsWith('.pdf')) {
      publicId = publicId.slice(0, -4);
    }
    
    console.log('   Normalized Public ID:', publicId);
    
    // Try different approaches to fetch the PDF
    let attempts = [
      // 1. Try as authenticated type with signing
      {
        name: 'Authenticated (Signed)',
        url: cloudinary.url(publicId, {
          resource_type: 'raw',
          type: 'authenticated',
          sign_url: true,
          secure: true,
          expires_at: Math.floor(Date.now() / 1000) + 3600
        })
      },
      // 2. Try as regular upload type with signing
      {
        name: 'Upload (Signed)',
        url: cloudinary.url(publicId, {
          resource_type: 'raw',
          type: 'upload',
          sign_url: true,
          secure: true
        })
      },
      // 3. Try direct unsigned URL (may work for public files)
      {
        name: 'Direct URL',
        url: cloudinary.url(publicId, {
          resource_type: 'raw',
          secure: true
        })
      },
      // 4. Try with file extension
      {
        name: 'With Extension',
        url: cloudinary.url(publicId + '.pdf', {
          resource_type: 'raw',
          type: 'upload',
          sign_url: true,
          secure: true
        })
      }
    ];
    
    let response = null;
    let lastError = null;
    
    for (const attempt of attempts) {
      try {
        console.log(`   Trying: ${attempt.name}`);
        console.log(`   URL: ${attempt.url}`);
        
        response = await axios({
          method: 'get',
          url: attempt.url,
          responseType: 'stream',
          timeout: 10000,
          validateStatus: (status) => status < 500 // Don't throw on 4xx
        });
        
        if (response.status === 200) {
          console.log(`✅ Success with: ${attempt.name}`);
          break;
        } else {
          console.log(`⚠️  Got status ${response.status} from ${attempt.name}`);
          lastError = new Error(`HTTP ${response.status}`);
        }
      } catch (err) {
        console.log(`❌ Failed: ${attempt.name} - ${err.message}`);
        lastError = err;
      }
    }
    
    if (!response || response.status !== 200) {
      throw lastError || new Error('Unable to fetch PDF from all attempts');
    }
    
    console.log('✅ Got PDF, streaming to client');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    
    response.data.pipe(res);
    
  } catch (error) {
    console.error('❌ Error fetching PDF:', error.message);
    res.status(404).json({ 
      error: 'Failed to fetch PDF', 
      message: error.message,
      publicId: req.params[0]
    });
  }
});

// @route   GET /api/documents/download/*
// @desc    Download PDF with signed URL
// @access  Public
router.get('/download/*', async (req, res) => {
  try {
    let publicId = req.params[0];
    const filename = req.query.filename || 'document.pdf';
    
    console.log('📥 PDF Download Request:', publicId);
    console.log('   Filename:', filename);
    
    // Normalize the public ID - remove file extension if present
    if (publicId.endsWith('.pdf')) {
      publicId = publicId.slice(0, -4);
    }
    
    console.log('   Normalized Public ID:', publicId);
    
    // Try different approaches to fetch the PDF
    let attempts = [
      // 1. Try as authenticated type with signing
      {
        name: 'Authenticated (Signed)',
        url: cloudinary.url(publicId, {
          resource_type: 'raw',
          type: 'authenticated',
          sign_url: true,
          secure: true,
          expires_at: Math.floor(Date.now() / 1000) + 3600
        })
      },
      // 2. Try as regular upload type with signing
      {
        name: 'Upload (Signed)',
        url: cloudinary.url(publicId, {
          resource_type: 'raw',
          type: 'upload',
          sign_url: true,
          secure: true
        })
      },
      // 3. Try direct unsigned URL (may work for public files)
      {
        name: 'Direct URL',
        url: cloudinary.url(publicId, {
          resource_type: 'raw',
          secure: true
        })
      },
      // 4. Try with file extension
      {
        name: 'With Extension',
        url: cloudinary.url(publicId + '.pdf', {
          resource_type: 'raw',
          type: 'upload',
          sign_url: true,
          secure: true
        })
      }
    ];
    
    let response = null;
    let lastError = null;
    
    for (const attempt of attempts) {
      try {
        console.log(`   Trying: ${attempt.name}`);
        console.log(`   URL: ${attempt.url}`);
        
        response = await axios({
          method: 'get',
          url: attempt.url,
          responseType: 'stream',
          timeout: 10000,
          validateStatus: (status) => status < 500 // Don't throw on 4xx
        });
        
        if (response.status === 200) {
          console.log(`✅ Success with: ${attempt.name}`);
          break;
        } else {
          console.log(`⚠️  Got status ${response.status} from ${attempt.name}`);
          lastError = new Error(`HTTP ${response.status}`);
        }
      } catch (err) {
        console.log(`❌ Failed: ${attempt.name} - ${err.message}`);
        lastError = err;
      }
    }
    
    if (!response || response.status !== 200) {
      throw lastError || new Error('Unable to fetch PDF from all attempts');
    }
    
    console.log('✅ Got PDF, streaming download to client');
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    response.data.pipe(res);
    
  } catch (error) {
    console.error('❌ Error downloading PDF:', error.message);
    res.status(404).json({ 
      error: 'Failed to download PDF', 
      message: error.message,
      publicId: req.params[0]
    });
  }
});

module.exports = router;
