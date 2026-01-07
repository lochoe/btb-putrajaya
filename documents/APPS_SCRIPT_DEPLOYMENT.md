# Apps Script Deployment - Kekal URL Sama

## Masalah: Setiap New Deployment = URL Baru

Jika buat **New deployment** setiap kali, akan dapat URL baru:
- URL lama: `https://script.google.com/macros/s/AKfycbz4.../exec`
- URL baru: `https://script.google.com/macros/s/AKfycbxEo.../exec` ← **Berbeza!**

Ini bermakna perlu update `APPS_SCRIPT_URL` di Vercel setiap kali. ❌

---

## Solution: Update Existing Deployment (Bukan New Deployment)

### Cara Update Deployment Yang Sedia Ada (URL Kekal Sama):

1. **Pergi ke Apps Script**: https://script.google.com
2. **Buka project** BTB Putrajaya
3. **Klik Deploy** → **Manage deployments**
4. **Jangan klik "New deployment"** ❌
5. **Cari deployment yang sedia ada** (ada icon pensil/edit)
6. **Klik icon pensil (Edit)** di deployment yang sedia ada
7. **Pilih "New version"** (bukan "New deployment")
8. **Klik "Deploy"**
9. URL **kekal sama** ✅

### Visual Guide:

```
Apps Script Dashboard
├── Deploy
│   └── Manage deployments
│       ├── [📝 Edit] Existing Deployment #1  ← Klik ini!
│       │   └── URL: https://script.google.com/macros/s/AKfycbz4.../exec
│       │
│       └── [➕ New deployment]  ← JANGAN klik ini!
```

**Klik Edit (pensil)** → Pilih "New version" → Deploy → **URL sama!** ✅

---

## Workflow yang Betul:

### Setiap Kali Edit Code:

1. **Edit code** dalam Apps Script (atau `clasp push`)
2. **Deploy** → **Manage deployments**
3. **Edit** deployment sedia ada (pensil icon)
4. **New version** → **Deploy**
5. ✅ **URL kekal sama** - tidak perlu update Vercel

---

## Jika Dah Terlanjur Buat New Deployment:

Jika dah buat new deployment dan dapat URL baru, ada 2 options:

### Option 1: Update Vercel Environment Variable (Cepat)

1. Pergi ke **Vercel Dashboard**
2. **Settings** → **Environment Variables**
3. Edit `APPS_SCRIPT_URL`
4. Update dengan URL baru
5. **Save** → Auto redeploy

### Option 2: Guna Vercel Function untuk Load Config (Lebih Flexible)

Buat function `/api/config.js` yang load dari env var - ini cara yang lebih baik kerana:
- Boleh tukar URL tanpa edit code
- Centralized configuration
- Environment-specific configs

---

## Best Practice: Guna Satu Deployment Sahaja

✅ **DO**: Update existing deployment dengan "New version"
❌ **DON'T**: Buat "New deployment" setiap kali

### Tips:

1. **Jangan delete** deployment lama (selama mana pun)
2. **Guna pensil icon** untuk update (bukan plus icon)
3. **Simpan URL** dalam Vercel environment variable (selamat)
4. **Test** selepas update deployment

---

## Troubleshooting:

### "Cannot find deployment"
- Deployment mungkin dah delete
- Buat **new deployment** sekali, kemudian **update** deployment tu setiap kali

### "URL masih berubah"
- Pastikan guna **Edit** (pensil), bukan **New deployment** (plus)
- Pastikan pilih **"New version"** bukan **"New deployment"**

### "Code tidak update"
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check Apps Script execution logs

---

## Alternative: Buat Vercel Function untuk Config

Jika nak lebih flexibility, boleh buat function untuk load config:

**File: `api/config.js`**
```javascript
export default function handler(req, res) {
  res.json({
    appsScriptUrl: process.env.APPS_SCRIPT_URL || ''
  });
}
```

**Frontend:**
```javascript
fetch('/api/config')
  .then(r => r.json())
  .then(config => {
    window.APPS_SCRIPT_URL = config.appsScriptUrl;
  });
```

Ini wayang, URL boleh tukar dalam Vercel env var tanpa edit code frontend.
