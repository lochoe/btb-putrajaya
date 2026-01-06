/**
 * File: jerseyBooking.js
 * Purpose: Handle jersey booking form (tempah baju) - validate jersey number (30-999, unique) and save to sheet.
 * Exposes: doGetJerseyForm(), submitJerseyBooking(), getTakenJerseyNumbers()
 * Notes: Uses sheet "Tempahan Jersi" in the registration spreadsheet.
 */

/**
 * doGetJerseyForm
 * What: Entry point untuk form tempahan baju; return HTML form.
 * Input: none
 * Output: HtmlOutput (renders `JerseyBooking.html`)
 * Side effects: none
 */
function doGetJerseyForm() {
  var template = HtmlService.createTemplateFromFile('JerseyBooking');
  template.takenNumbers = getTakenJerseyNumbers(); // Preload nombor yang dah taken
  return template.evaluate().setTitle('Tempahan Baju BTB Putrajaya');
}

/**
 * getTakenJerseyNumbers
 * What: Get semua nombor jersi yang dah dipesan dari sheet "Tempahan Jersi".
 * Input: none (uses CONFIG.registrationSheetId)
 * Output: number[] (array nombor yang dah taken, e.g. [30, 45, 99])
 * Side effects: read-only access to sheet
 * Errors: returns [] if sheet missing or no data
 */
function getTakenJerseyNumbers() {
  try {
    var registrationSheetId = typeof CONFIG !== 'undefined' && CONFIG.registrationSheetId;
    if (!registrationSheetId) {
      return [];
    }

    var spreadsheet = SpreadsheetApp.openById(registrationSheetId);
    var sheet = spreadsheet.getSheetByName('Tempahan Jersi');

    if (!sheet) {
      // Sheet belum wujud lagi (form pertama kali), return empty
      return [];
    }

    var data = sheet.getDataRange().getValues();
    if (data.length < 2) {
      return []; // Tiada data (hanya header atau kosong)
    }

    // Assume column untuk "Nombor Jersi" adalah column ke-8 (index 7) - adjust ikut header sebenar
    var headers = data[0];
    var jerseyNumberIndex = headers.indexOf('Nombor Jersi');
    if (jerseyNumberIndex === -1) {
      // Fallback: assume column 8 (index 7) kalau header tak jumpa
      jerseyNumberIndex = 7;
    }

    var takenNumbers = [];
    for (var i = 1; i < data.length; i++) {
      var num = data[i][jerseyNumberIndex];
      if (num && !isNaN(num) && num >= 30 && num <= 999) {
        takenNumbers.push(Number(num));
      }
    }

    return takenNumbers;
  } catch (e) {
    Logger.log('getTakenJerseyNumbers ERROR: ' + e);
    return [];
  }
}

/**
 * uploadReceipt
 * What: Upload receipt file ke Google Drive folder.
 * Input: fileData: {name: string, type: string, data: string (base64)}, playerName: string, jerseyNumber: number
 * Output: {success: boolean, fileUrl: string, message?: string}
 * Side effects: creates file in Google Drive
 * Errors: returns {success: false, message: "..."}
 */
function uploadReceipt(fileData, playerName, jerseyNumber) {
  try {
    if (!fileData || !fileData.data) {
      return { success: false, message: 'Tiada fail dipilih.' };
    }

    // Get folder ID from CONFIG (use existing folderId or create new)
    var folderId = typeof CONFIG !== 'undefined' && CONFIG.folderId;
    if (!folderId) {
      return { success: false, message: 'Configuration error: folderId missing.' };
    }

    var folder = DriveApp.getFolderById(folderId);
    
    // Create subfolder for receipts if doesn't exist
    var receiptsFolder;
    try {
      var folders = folder.getFoldersByName('Resit Tempahan Baju');
      if (folders.hasNext()) {
        receiptsFolder = folders.next();
      } else {
        receiptsFolder = folder.createFolder('Resit Tempahan Baju');
      }
    } catch (e) {
      receiptsFolder = folder; // Fallback to main folder
    }

    // Convert base64 to blob
    var blob = Utilities.newBlob(Utilities.base64Decode(fileData.data), fileData.type, fileData.name);

    // Generate filename: Resit_[PlayerName]_[JerseyNumber]_[Timestamp].ext
    var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd_HHmmss');
    var sanitizedName = (playerName || 'Unknown').replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30);
    var fileExtension = fileData.name.split('.').pop() || 'jpg';
    var fileName = 'Resit_' + sanitizedName + '_' + jerseyNumber + '_' + timestamp + '.' + fileExtension;

    // Upload file
    var file = receiptsFolder.createFile(blob);
    file.setName(fileName);
    
    // Set sharing to "Anyone with the link can view"
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    
    var fileUrl = file.getUrl();
    
    Logger.log('uploadReceipt: File uploaded - ' + fileName + ', URL: ' + fileUrl);
    
    return {
      success: true,
      fileUrl: fileUrl
    };
  } catch (e) {
    Logger.log('uploadReceipt ERROR: ' + e);
    return { success: false, message: 'Ralat upload: ' + e.toString() };
  }
}

/**
 * submitJerseyBooking
 * What: Validate & save tempahan baju ke sheet "Tempahan Jersi".
 * Input: formData: object {playerName, email, parentName, address, icNumber, jerseySize, jerseyName, jerseyNumber, receiptUrl}
 * Output: {success: boolean, message: string, takenNumbers?: number[]}
 * Side effects: writes to sheet "Tempahan Jersi"
 * Errors: returns {success: false, message: "..."} dengan error details
 */
function submitJerseyBooking(formData) {
  try {
    // Validate input
    if (!formData || typeof formData !== 'object') {
      return { success: false, message: 'Data tidak sah.' };
    }

    var playerName = (formData.playerName || '').trim();
    var email = (formData.email || '').trim();
    var parentName = (formData.parentName || '').trim();
    var address = (formData.address || '').trim();
    var icNumber = (formData.icNumber || '').trim();
    var jerseySize = (formData.jerseySize || '').trim();
    var jerseyName = (formData.jerseyName || '').trim();
    var jerseyNumber = formData.jerseyNumber ? Number(formData.jerseyNumber) : null;
    var receiptUrl = (formData.receiptUrl || '').trim();

    // Validate required fields
    if (!playerName || !email || !parentName || !address || !icNumber || !jerseySize || !jerseyName || jerseyNumber === null) {
      return { success: false, message: 'Sila isi semua medan yang wajib.' };
    }

    // Validate jersey number range (30-999)
    if (isNaN(jerseyNumber) || jerseyNumber < 30 || jerseyNumber > 999) {
      return { success: false, message: 'Nombor jersi mesti antara 30 hingga 999.' };
    }

    // Check if jersey number already taken
    var takenNumbers = getTakenJerseyNumbers();
    if (takenNumbers.indexOf(jerseyNumber) !== -1) {
      return {
        success: false,
        message: 'Nombor jersi ' + jerseyNumber + ' sudah dipesan. Sila pilih nombor lain.',
        takenNumbers: takenNumbers
      };
    }

    // Get or create sheet "Tempahan Jersi"
    var registrationSheetId = typeof CONFIG !== 'undefined' && CONFIG.registrationSheetId;
    if (!registrationSheetId) {
      return { success: false, message: 'Configuration error: registrationSheetId missing.' };
    }

    var spreadsheet = SpreadsheetApp.openById(registrationSheetId);
    var sheet = spreadsheet.getSheetByName('Tempahan Jersi');

    if (!sheet) {
      // Create sheet dengan headers
      sheet = spreadsheet.insertSheet('Tempahan Jersi');
      var headers = [
        'Timestamp',
        'Nama Pemain',
        'Email',
        'Nama Ibu Bapa Penjaga',
        'Alamat',
        'No. IC Pemain',
        'Saiz Baju',
        'Nama di Jersi',
        'Nombor Jersi',
        'Resit Bayaran (URL)'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    }

    // Append new row
    var timestamp = new Date();
    var newRow = [
      timestamp,
      playerName,
      email,
      parentName,
      address,
      icNumber,
      jerseySize,
      jerseyName,
      jerseyNumber,
      receiptUrl
    ];

    sheet.appendRow(newRow);

    // Return success dengan updated taken numbers
    takenNumbers.push(jerseyNumber);
    return {
      success: true,
      message: 'Tempahan baju berjaya disimpan! Nombor jersi ' + jerseyNumber + ' telah dipesan.',
      takenNumbers: takenNumbers
    };
  } catch (e) {
    Logger.log('submitJerseyBooking ERROR: ' + e);
    return { success: false, message: 'Ralat: ' + e.toString() };
  }
}
