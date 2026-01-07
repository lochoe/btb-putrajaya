# BTB Putrajaya - Player Registration System

Sistem pendaftaran dan pengurusan pemain untuk BTB Putrajaya menggunakan Google Apps Script dan Vercel.

## 📚 Documentation

Semua dokumentasi lengkap ada dalam folder [`documents/`](./documents/):

**Quick Links:**
- 📖 [Project Structure](./documents/PROJECT_STRUCTURE.md) - Struktur project dan file organization
- ⚙️ [Vercel Configuration](./documents/VERCEL_CONFIG.md) - Setup Vercel deployment
- 📤 [Apps Script Deployment](./documents/APPS_SCRIPT_DEPLOYMENT.md) - Deploy Apps Script (kekal URL sama)
- 🖼️ [ImageBB Setup](./documents/IMGBB_SETUP.md) - Setup ImageBB untuk upload images
- 🔄 [Sync to Apps Script](./documents/SYNC_TO_APPS_SCRIPT.md) - Cara sync files

Baca [`documents/README.md`](./documents/README.md) untuk complete documentation index.

---

## Overview

Sistem pendaftaran dan pengurusan pemain untuk BTB Putrajaya.

## Features

- 📋 **Senarai Pemain** - Papar senarai pemain dengan filter (tahap penguasaan, umur, nama)
- 👕 **Tempahan Baju** - Form untuk pemain tempah baju dengan:
  - Upload resit bayaran ke Google Drive
  - Validasi nombor jersi unik (30-999)
  - Simpan data ke Google Sheets

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Google Apps Script
- **Storage**: Google Sheets (data), Google Drive (resit)

## Setup

### 1. Clone Repository

```bash
git clone https://github.com/lochoe/btb-putrajaya.git
cd btb-putrajaya
```

### 2. Setup Google Apps Script

1. Copy `config.example.js` ke `config.js`
2. Isi nilai sebenar dalam `config.js`:
   - `registrationSheetId` - ID Google Sheet untuk data pemain
   - `folderId` - ID Google Drive folder untuk simpan resit
   - `adminEmail` - Email admin

### 3. Deploy ke Apps Script

Guna `clasp` untuk sync automatik:

```bash
# Install clasp
npm install -g @google/clasp

# Login
clasp login

# Push ke Apps Script
clasp push
```

Atau manual copy-paste (lihat `SYNC_TO_APPS_SCRIPT.md`)

### 4. Deploy Web App

1. Dalam Apps Script, klik **Deploy** → **New deployment**
2. Pilih **Web app**
3. **Execute as**: `Me`
4. **Who has access**: `Anyone with the link`
5. Copy URL deployment

## File Structure

```
btb-putrajaya/
├── Index.html              # Main page (player list + navigation)
├── JerseyBooking.html      # Jersey booking form
├── doGet.js               # Web app entry point
├── jerseyBooking.js       # Backend logic (booking + upload)
├── config.js              # Configuration (gitignored)
├── config.example.js      # Config template
├── appsscript.json        # Apps Script manifest
├── .clasp.json           # Clasp configuration
└── README.md             # This file
```

## Usage

### Player List Page
- Filter by skill level (BEGINNER, BASIC, INTERMEDIATE)
- Filter by age
- Search by player name or parent name
- Show only players with images

### Jersey Booking Page
- Fill in player details
- Select jersey size (XS-XXL)
- Enter jersey name (max 20 characters)
- Choose unique jersey number (30-999)
- Upload payment receipt (image or PDF)
- Receipt will be saved to Google Drive folder "Resit Tempahan Baju"

## Notes

- `config.js` tidak di-commit ke GitHub (ada dalam `.gitignore`)
- Guna `config.example.js` sebagai template
- File resit akan auto-save ke subfolder "Resit Tempahan Baju" dalam folder yang ditetapkan
- Jersey numbers mesti unik - sistem akan check sebelum save

## License

Private project for BTB Putrajaya
