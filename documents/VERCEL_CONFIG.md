# Konfigurasi Vercel untuk BTB Putrajaya

## Masalah: Form submission tidak berfungsi di Vercel

Form submission tidak berfungsi kerana:
1. `JerseyBooking.html` masih guna `google.script.run` yang hanya work dalam Apps Script
2. Perlu set `APPS_SCRIPT_URL` untuk call Apps Script API dari Vercel

## Langkah 1: Dapatkan Apps Script Web App URL

1. Pergi ke Apps Script: https://script.google.com
2. Buka project BTB Putrajaya
3. Klik **Deploy** → **Manage deployments**
4. Copy **Web app URL** (contoh: `https://script.google.com/macros/s/AKfycby.../exec`)

## Langkah 2: Set Environment Variable di Vercel

1. Pergi ke Vercel Dashboard: https://vercel.com
2. Pilih project **btb-putrajaya**
3. Pergi ke **Settings** → **Environment Variables**
4. Tambah variable baru:
   - **Name**: `APPS_SCRIPT_URL`
   - **Value**: Paste Apps Script Web App URL anda
   - **Environment**: Production, Preview, Development (check semua)
5. Klik **Save**

## Langkah 3: Update HTML untuk Guna Environment Variable

File `JerseyBooking.html` dan `Index.html` dah ada code untuk detect `APPS_SCRIPT_URL`. Tapi untuk guna environment variable dari Vercel, kita perlu update sedikit.

**Option 1: Hardcode dalam HTML (untuk test cepat)**

Dalam `Index.html` dan `JerseyBooking.html`, cari:
```javascript
window.APPS_SCRIPT_URL = window.APPS_SCRIPT_URL || '';
```

Tukar kepada:
```javascript
window.APPS_SCRIPT_URL = window.APPS_SCRIPT_URL || 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';
```

**Option 2: Guna Vercel Environment Variable (recommended)**

Buat file `api-config.js` yang load dari environment:

```javascript
// api-config.js
window.APPS_SCRIPT_URL = '%VERCEL_ENV_APPS_SCRIPT_URL%';
```

Tapi Vercel environment variables hanya available dalam serverless functions, bukan dalam static HTML.

**Solution: Guna Vercel Serverless Function sebagai Proxy**

Buat folder `api/` dan file `config.js`:

```javascript
// api/config.js
export default function handler(req, res) {
  res.json({ 
    appsScriptUrl: process.env.APPS_SCRIPT_URL || '' 
  });
}
```

Kemudian dalam HTML, load config:
```javascript
fetch('/api/config')
  .then(r => r.json())
  .then(config => {
    window.APPS_SCRIPT_URL = config.appsScriptUrl;
  });
```

## Langkah 4: Redeploy di Vercel

Selepas set environment variable:
1. Vercel akan auto-redeploy
2. Atau manual: **Deployments** → **Redeploy**

## Test

1. Buka https://btb-putrajaya.vercel.app/
2. Isi form tempahan baju
3. Submit
4. Check Google Sheets "Tempahan Jersi" - data sepatutnya masuk

## Troubleshooting

### Error: "APPS_SCRIPT_URL not configured"
- Pastikan environment variable dah set dalam Vercel
- Pastikan dah redeploy selepas set variable
- Check browser console untuk error details

### Error: "Failed to load API"
- Check Apps Script Web App URL betul
- Pastikan Apps Script deployment "Who has access" = "Anyone with the link"
- Check Apps Script execution logs untuk errors

### Data tidak masuk ke Sheets
- Check Apps Script execution logs
- Pastikan `submitJerseyBooking()` function ada dalam `jerseyBooking.js`
- Pastikan sheet "Tempahan Jersi" wujud (akan auto-create jika tak ada)
