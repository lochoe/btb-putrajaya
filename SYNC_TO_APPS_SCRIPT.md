# Cara Sync File ke Google Apps Script

## Pilihan 1: Manual Copy-Paste (Paling Senang)

### Langkah 1: Copy `jerseyBooking.js` → Apps Script

1. Buka file `jerseyBooking.js` dalam folder ini
2. **Select All** (Ctrl+A) → **Copy** (Ctrl+C)
3. Pergi ke Apps Script: https://script.google.com/u/0/home/projects/1t1fHWCAFUXWR1oBQTzhGKvVdUX3QCaCqqS7QnCZIqbzfHnq8v_eiqrJ4/edit
4. Klik **+** (Add file) → pilih **Script**
5. Nama file: `JerseyBooking` (atau `JerseyBooking.gs` - Apps Script akan auto tambah `.gs`)
6. **Paste** semua kod dari `jerseyBooking.js`
7. **Save** (Ctrl+S)

### Langkah 2: Copy `JerseyBooking.html` → Apps Script

1. Buka file `JerseyBooking.html` dalam folder ini
2. **Select All** (Ctrl+A) → **Copy** (Ctrl+C)
3. Dalam Apps Script, klik **+** (Add file) → pilih **HTML**
4. Nama file: `JerseyBooking` (tanpa extension)
5. **Paste** semua HTML dari `JerseyBooking.html`
6. **Save** (Ctrl+S)

### Langkah 3: Update `config.js` (jika perlu)

1. Buka `config.js` dalam folder ini
2. Copy kandungan `CONFIG` object
3. Dalam Apps Script, buka file `config.gs` (atau buat baru)
4. Paste & **Save**

### Langkah 4: Deploy Web App

1. Dalam Apps Script, klik **Deploy** → **New deployment**
2. Pilih **Web app** (ikon globe)
3. **Function**: pilih `doGetJerseyForm` (bukan `doGet`)
4. **Execute as**: `Me`
5. **Who has access**: `Anyone with the link`
6. Klik **Deploy**
7. Copy URL yang diberikan

---

## Pilihan 2: Guna `clasp` (Command Line Apps Script Projects) - Sync Automatik

### Setup clasp (sekali sahaja)

1. Install Node.js (jika belum ada): https://nodejs.org/
2. Install clasp:
   ```bash
   npm install -g @google/clasp
   ```
3. Login clasp:
   ```bash
   clasp login
   ```
   (Browser akan buka untuk authorize)

### Link folder ke Apps Script project

1. Dalam folder `btbputrajaya`, buat file `.clasp.json`:
   ```json
   {
     "scriptId": "1t1fHWCAFUXWR1oBQTzhGKvVdUX3QCaCqqS7QnCZIqbzfHnq8v_eiqrJ4"
   }
   ```

2. Buat file `.claspignore` (optional, untuk skip file yang tak perlu):
   ```
   index.html
   code.js
   testOpenForm.js
   populateCheckboxes.js
   .git/
   .gitignore
   ```

3. Buat file `appsscript.json` (untuk Apps Script manifest):
   ```json
   {
     "timeZone": "Asia/Kuala_Lumpur",
     "dependencies": {},
     "exceptionLogging": "STACKDRIVER",
     "runtimeVersion": "V8"
   }
   ```

### Push ke Apps Script

```bash
cd /home/lochoe/sandbox/btbputrajaya
clasp push
```

**Nota**: 
- File `.js` akan jadi `.gs` automatik
- File `.html` akan kekal sebagai HTML
- `clasp push` akan **overwrite** semua file dalam Apps Script dengan versi dari folder local

### Pull dari Apps Script (kalau ada perubahan di Apps Script)

```bash
clasp pull
```

---

## Mapping File Local → Apps Script

| File Local | Apps Script | Type |
|------------|-------------|------|
| `config.js` | `config.gs` | Script |
| `doGet.js` | `doGet.gs` atau `Code.gs` | Script |
| `jerseyBooking.js` | `JerseyBooking.gs` | Script |
| `Index.html` | `Index` | HTML |
| `JerseyBooking.html` | `JerseyBooking` | HTML |

---

## Tips

- **Manual copy-paste** paling senang untuk sekali-sekala update
- **clasp** bagus kalau tuan selalu edit dalam local folder dan nak sync automatik
- Apps Script **tak support** `.js` extension - semua script file mesti `.gs` (tapi clasp handle ini automatik)
