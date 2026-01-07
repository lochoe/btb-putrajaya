# BTB Putrajaya - Project Structure

## 📁 Folder Structure

```
btbputrajaya/
├── 📂 api/                          # Vercel Serverless Functions (ES6)
│   ├── config.js                    # Load config from env vars
│   └── upload-image.js              # Upload images to ImageBB
│
├── 📂 apps-script/                  # Google Apps Script Files (legacy - files in root)
│   ├── doGet.js                     # Main entry point & API handler
│   ├── jerseyBooking.js             # Jersey booking functions
│   ├── config.js                    # Apps Script configuration
│   └── ...                          # Other Apps Script utilities
│
├── 📂 frontend/                     # Vercel Frontend Files (HTML/JS)
│   ├── EmailSearch.html             # Email search page
│   ├── ChildrenList.html            # Children list page
│   ├── PlayerProfile.html           # Player profile page
│   ├── api.js                       # API wrapper for Apps Script
│   └── ...                          # Other frontend files
│
├── .claspignore                     # Files to exclude from Apps Script
├── .clasp.json                      # Apps Script project config
├── vercel.json                      # Vercel deployment config
└── README.md                        # Project documentation
```

## 🎯 File Categories

### 1. **Google Apps Script Files** (Backend)
Files yang akan di-push ke Apps Script menggunakan `clasp push`:

- ✅ `doGet.js` - Main handler & API endpoints
- ✅ `jerseyBooking.js` - Jersey booking functions
- ✅ `config.js` - Configuration (CONFIG object)
- ✅ `populateCheckboxes.js` - Utility functions
- ✅ `testOpenForm.js` - Test utilities
- ✅ `code.js` - Additional utilities
- ✅ `Index.html` - Legacy (Apps Script hosted)
- ✅ `JerseyBooking.html` - Legacy (Apps Script hosted)
- ✅ `appsscript.json` - Apps Script manifest

**Command:** `clasp push` (push semua files ke Apps Script)

### 2. **Vercel Frontend Files** (Frontend)
Files untuk Vercel static hosting - **TIDAK** di-push ke Apps Script:

- ❌ `EmailSearch.html` - Email search page
- ❌ `ChildrenList.html` - Children list page
- ❌ `PlayerProfile.html` - Player profile page
- ❌ `Index.html` - Main listing (Vercel version)
- ❌ `JerseyBooking.html` - Jersey booking form (Vercel version)
- ❌ `api.js` - Frontend API wrapper
- ❌ `api-config.js` - Frontend config helper

**Deployment:** Auto-deploy ke Vercel via Git push

### 3. **Vercel Serverless Functions** (Backend API)
ES6 modules untuk Vercel - **TIDAK** compatible dengan Apps Script:

- ❌ `api/config.js` - Return config from env vars
- ❌ `api/upload-image.js` - Upload images to ImageBB

**Deployment:** Auto-deploy ke Vercel as serverless functions

## 🔄 Workflow

### Development Workflow

1. **Edit Apps Script Files:**
   ```bash
   # Edit files: doGet.js, jerseyBooking.js, etc.
   clasp push          # Push to Apps Script
   ```

2. **Edit Vercel Frontend:**
   ```bash
   # Edit files: PlayerProfile.html, api.js, etc.
   git push            # Auto-deploy to Vercel
   ```

3. **Edit Vercel Functions:**
   ```bash
   # Edit files: api/upload-image.js, etc.
   git push            # Auto-deploy to Vercel
   ```

## 🔐 Environment Variables

### Vercel Environment Variables:
- `APPS_SCRIPT_URL` - Apps Script Web App URL
- `IMGBB_API_KEY` - ImageBB API key for image uploads

**Set via:** Vercel Dashboard → Settings → Environment Variables

### Apps Script Configuration:
- `CONFIG` object in `config.js`
- Set `registrationSheetId`, `folderId`, etc.

## 📝 Important Notes

### ⚠️ DO NOT:
- ❌ Push `api/` folder ke Apps Script (ES6 modules incompatible)
- ❌ Push Vercel HTML files ke Apps Script (not needed)
- ❌ Push `vercel.json` ke Apps Script
- ❌ Mix ES6 `export` syntax in Apps Script files

### ✅ DO:
- ✅ Keep Apps Script files in root (doGet.js, config.js, etc.)
- ✅ Keep Vercel files separated (api/, HTML files)
- ✅ Use `.claspignore` to exclude Vercel files
- ✅ Use `clasp push` only for Apps Script files
- ✅ Use Git push for Vercel deployment

## 🛠️ Tools

- **clasp** - Sync files to Google Apps Script
- **Git** - Version control & Vercel deployment
- **Vercel CLI** - (Optional) Local Vercel testing

## 📚 Documentation

- `SYNC_TO_APPS_SCRIPT.md` - How to sync to Apps Script
- `VERCEL_CONFIG.md` - Vercel configuration
- `APPS_SCRIPT_DEPLOYMENT.md` - Apps Script deployment guide
- `IMGBB_SETUP.md` - ImageBB setup guide
