/**
 * Vercel Serverless Function untuk upload image ke ImageBB
 * API key disimpan dalam environment variable IMGBB_API_KEY
 */

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use POST.' 
    });
  }

  try {
    // Get API key from environment variable
    const apiKey = process.env.IMGBB_API_KEY;
    
    if (!apiKey) {
      console.error('IMGBB_API_KEY environment variable not set');
      return res.status(500).json({ 
        success: false, 
        error: 'Server configuration error: IMGBB_API_KEY not set' 
      });
    }

    // Get base64 image data from request body
    const { imageData } = req.body;
    
    if (!imageData) {
      return res.status(400).json({ 
        success: false, 
        error: 'Missing imageData in request body' 
      });
    }

    // Create form data for ImageBB API
    const formData = new URLSearchParams();
    formData.append('key', apiKey);
    formData.append('image', imageData);
    formData.append('expiration', '0'); // Never expire

    // Upload to ImageBB
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    const result = await response.json();

    if (result.success && result.data && result.data.url) {
      return res.status(200).json({
        success: true,
        fileUrl: result.data.url,
        thumbnailUrl: result.data.thumb ? result.data.thumb.url : result.data.url,
        deleteUrl: result.data.delete_url || null
      });
    } else {
      console.error('ImageBB API error:', result);
      return res.status(400).json({
        success: false,
        error: result.error ? result.error.message : 'Upload failed - unknown error'
      });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error: ' + error.message
    });
  }
}
