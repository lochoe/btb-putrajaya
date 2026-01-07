/**
 * Vercel Serverless Function untuk return config
 * Load APPS_SCRIPT_URL dari environment variable
 */
export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ 
      success: false, 
      error: 'Method not allowed. Use GET.' 
    });
  }

  // Return config dari environment variables
  res.json({
    success: true,
    appsScriptUrl: process.env.APPS_SCRIPT_URL || '',
    imgbbApiKey: 'hidden' // API key dalam env var, tidak expose
  });
}
