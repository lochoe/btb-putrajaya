# Setup Vercel untuk BTB Putrajaya

## Prerequisites

1. Apps Script Web App dah deploy (dapat URL)
2. GitHub account
3. Vercel account (percuma)

## Langkah 1: Update Apps Script untuk Support API Endpoints

Apps Script perlu ada API endpoints yang return JSON. Tambah function ni dalam `doGet.js`:

```javascript
/**
 * Handle API requests (for Vercel/external frontend)
 */
function doGet(e) {
  // Check if this is an API call
  if (e.parameter.action) {
    return handleAPIRequest(e);
  }
  
  // Otherwise, return HTML (existing code)
  // ... existing doGet code ...
}

function handleAPIRequest(e) {
  var action = e.parameter.action;
  var callback = e.parameter.callback; // For JSONP
  
  var result;
  
  try {
    switch(action) {
      case 'getData':
        result = { success: true, data: getData() };
        break;
      case 'getTakenJerseyNumbers':
        result = { success: true, data: getTakenJerseyNumbers() };
        break;
      default:
        result = { success: false, error: 'Unknown action' };
    }
  } catch (error) {
    result = { success: false, error: error.toString() };
  }
  
  // Return JSONP if callback specified, otherwise JSON
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  var action = e.parameter.action;
  var postData = JSON.parse(e.postData.contents || '{}');
  var callback = e.parameter.callback;
  
  var result;
  
  try {
    switch(action) {
      case 'uploadReceipt':
        result = uploadReceipt(
          postData.fileData,
          postData.playerName,
          postData.jerseyNumber
        );
        break;
      case 'submitJerseyBooking':
        result = submitJerseyBooking(postData);
        break;
      default:
        result = { success: false, error: 'Unknown action' };
    }
  } catch (error) {
    result = { success: false, error: error.toString() };
  }
  
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + JSON.stringify(result) + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  } else {
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Langkah 2: Deploy ke Vercel

### Option A: Via Vercel Dashboard (Paling Senang)

1. Pergi ke [vercel.com](https://vercel.com)
2. Sign up / Login dengan GitHub
3. Klik **Add New Project**
4. Import repo `lochoe/btb-putrajaya`
5. Vercel akan auto-detect settings
6. **Environment Variables** (optional):
   - `APPS_SCRIPT_URL` = URL Apps Script Web App anda
7. Klik **Deploy**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
cd /home/lochoe/sandbox/btbputrajaya
vercel

# Set environment variable
vercel env add APPS_SCRIPT_URL
# Paste your Apps Script Web App URL when prompted
```

## Langkah 3: Update Frontend untuk Guna API

Frontend perlu detect kalau running di Vercel atau Apps Script:

1. Kalau running di Apps Script → guna `google.script.run`
2. Kalau running di Vercel → guna `api.js` dengan fetch/JSONP

File `api.js` dah ada auto-detect untuk kedua-dua cases.

## Langkah 4: Update HTML Files

Dalam `Index.html` dan `JerseyBooking.html`, tambah:

```html
<!-- Add before closing </head> -->
<script>
  // Set Apps Script URL (from environment or config)
  window.APPS_SCRIPT_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
</script>
<script src="api.js"></script>
```

Kemudian replace semua `google.script.run` dengan `API.getData()`, `API.submitJerseyBooking()`, etc.

## Nota Penting

- Apps Script Web Apps **tidak support CORS**, jadi kita guna JSONP workaround
- Atau guna Vercel Serverless Function sebagai proxy (lebih baik)
- File upload mungkin perlu special handling (base64 → Apps Script)

## Troubleshooting

### Error: "APPS_SCRIPT_URL not configured"
- Set environment variable dalam Vercel dashboard
- Atau hardcode dalam HTML (tidak recommended untuk production)

### Error: CORS
- Apps Script Web Apps memang tak support CORS
- Guna JSONP workaround (dah ada dalam `api.js`)
- Atau guna Vercel Serverless Function sebagai proxy

### File upload tidak berfungsi
- File upload perlu special handling
- Mungkin perlu guna form submission dengan iframe
- Atau guna Vercel Serverless Function untuk handle upload

## Alternatif: Guna Vercel Serverless Function sebagai Proxy

Buat file `api/proxy.js`:

```javascript
export default async function handler(req, res) {
  const { action, data } = req.query;
  
  const appsScriptUrl = process.env.APPS_SCRIPT_URL;
  const response = await fetch(appsScriptUrl + '?action=' + action, {
    method: 'POST',
    body: JSON.stringify(data),
    headers: { 'Content-Type': 'application/json' }
  });
  
  const result = await response.json();
  res.json(result);
}
```

Kemudian frontend call `/api/proxy?action=getData` instead of direct Apps Script URL.
