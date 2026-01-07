# Setup ImageBB API Key untuk Upload Images

## Masalah: API Key dalam HTML File (Tidak Selamat)

Meletakkan API key dalam HTML file adalah **tidak selamat** kerana:
- API key boleh dilihat oleh sesiapa sahaja (view source)
- Boleh di-copy dan digunakan oleh orang lain
- Risk untuk abuse (rate limiting, quota exceeded)

## Solution: Vercel Serverless Function + Environment Variable

### Langkah 1: Set Environment Variable di Vercel

1. Pergi ke **Vercel Dashboard**: https://vercel.com
2. Pilih project **btb-putrajaya**
3. Pergi ke **Settings** → **Environment Variables**
4. Tambah variable baru:
   - **Name**: `IMGBB_API_KEY`
   - **Value**: `e91bbb20d060d072231273fec6c993eb`
   - **Environment**: Production, Preview, Development (check semua)
5. Klik **Save**

### Langkah 2: File Structure

```
btbputrajaya/
├── api/
│   └── upload-image.js    ← Vercel Serverless Function
├── PlayerProfile.html     ← Frontend (tidak ada API key)
└── vercel.json           ← Routing config
```

### Langkah 3: Cara Ia Berfungsi

1. **Frontend** (PlayerProfile.html):
   - User pilih gambar
   - Convert ke base64
   - POST ke `/api/upload-image` (Vercel function)

2. **Backend** (api/upload-image.js):
   - Receive base64 image
   - Get `IMGBB_API_KEY` dari environment variable
   - Upload ke ImageBB API
   - Return image URL kepada frontend

3. **Frontend**:
   - Dapat image URL
   - Simpan URL ke Google Sheets

### Langkah 4: Redeploy

Selepas set environment variable:
1. Vercel akan auto-redeploy
2. Atau manual: **Deployments** → **Redeploy**

### Test

1. Buka https://btb-putrajaya.vercel.app/PlayerProfile.html
2. Pilih gambar untuk upload
3. Upload patut berjaya (check browser console untuk logs)

## Security Benefits

✅ API key hanya dalam Vercel environment variable (selamat)
✅ Frontend code tidak expose API key
✅ Rate limiting tetap berlaku di ImageBB side
✅ Mudah tukar API key tanpa edit code

## Troubleshooting

### Error: "IMGBB_API_KEY not set"
- Pastikan environment variable dah set dalam Vercel
- Pastikan dah redeploy selepas set variable

### Error: "Upload failed"
- Check browser console untuk error details
- Check Vercel function logs di Dashboard → Functions
- Pastikan ImageBB API key betul dan aktif
