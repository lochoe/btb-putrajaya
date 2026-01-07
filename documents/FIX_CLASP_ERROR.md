# Fix clasp push error: "Unexpected token 'export'"

## Error:
```
Syntax error: SyntaxError: Unexpected token 'export' line: 5 file: api/config.gs
```

## Sebab:
File `api/config.js` dan `api/upload-image.js` adalah **Vercel serverless functions** yang guna ES6 `export` syntax. Apps Script **tidak support** ES6 modules, jadi file ni tidak patut dalam Apps Script.

## Solution:

### Option 1: Delete file dari Apps Script (Recommended)

1. Buka **Apps Script**: https://script.google.com
2. Check jika ada file `api/config.gs` atau folder `api/`
3. **Delete** file/folder tersebut (jika ada)
4. Klik **Save**
5. Try `clasp push` lagi

### Option 2: Pastikan .claspignore betul

File `.claspignore` dah ada `api/` dalam list, jadi file dari folder `api/` patut di-ignore.

Tapi kalau file dah ada dalam Apps Script dari sebelum, clasp mungkin masih complain.

### Option 3: Manual check Apps Script

1. Buka Apps Script editor
2. Check file list di kiri
3. Look for:
   - `api/config.gs`
   - `api/upload-image.gs`
   - Folder `api/`
4. Delete semua yang berkaitan dengan `api/`
5. Save
6. Try `clasp push` lagi

## Prevention:

✅ Folder `api/` dah dalam `.claspignore`
✅ File `api/*.js` hanya untuk Vercel, bukan Apps Script
✅ Apps Script hanya perlu:
   - `doGet.js`
   - `jerseyBooking.js`
   - `config.js`
   - `Index.html`
   - `JerseyBooking.html`

## Notes:

- **Vercel serverless functions** (`api/*.js`) = untuk Vercel sahaja
- **Apps Script** = backend untuk Google Sheets
- Kedua-dua berfungsi berasingan, tidak perlu dalam project yang sama
