/**
 * File: doGet.js
 * Purpose: Serve the main HTML UI and expose player registration data from Google Sheets.
 * Exposes: doGet(): HtmlOutput, getData(): Player[]
 * Notes: Reads data from the "Form Responses 1" sheet in the active spreadsheet.
 */

/**
 * doGet
 * What: Entry point for the web app; handles routing untuk senarai pemain atau form tempahan baju.
 * Input: e.parameter.page (optional: 'jersey' untuk form tempahan, default: senarai pemain)
 * Output: HtmlOutput (renders `Index.html` atau `JerseyBooking.html`)
 * Side effects: none
 * Errors: relies on Apps Script runtime; throws if HTML file is missing.
 */
function doGet(e) {
  try {
    // Check if this is an API call (for Vercel/external frontend)
    if (e.parameter && e.parameter.action) {
      return handleAPIRequest(e);
    }
    
    // Otherwise, return HTML (existing code)
    // Return JerseyBooking.html as main page (tempahan baju)
    // Client-side JavaScript will handle routing/show-hide
    Logger.log('doGet: loading main page (jersey booking) with client-side routing');
    var template = HtmlService.createTemplateFromFile('JerseyBooking');
    
    // Preload taken jersey numbers for jersey form
    var takenNumbers = [];
    try {
      if (typeof getTakenJerseyNumbers === 'function') {
        takenNumbers = getTakenJerseyNumbers();
        Logger.log('doGet: getTakenJerseyNumbers returned ' + takenNumbers.length + ' numbers');
      }
    } catch (err) {
      Logger.log('doGet: ERROR calling getTakenJerseyNumbers - ' + err);
    }
    template.takenNumbers = takenNumbers;
    
    var output = template.evaluate();
    Logger.log('doGet: template evaluated');
    return output.setTitle('BTB Putrajaya 2025');
  } catch (error) {
    Logger.log('doGet: FATAL ERROR - ' + error);
    return HtmlService.createHtmlOutput('<h1>Error</h1><p>' + error.toString() + '</p>');
  }
}

/**
 * Handle API requests (for Vercel/external frontend)
 * Supports JSONP for CORS workaround
 */
function handleAPIRequest(e) {
  var action = e.parameter.action;
  var callback = e.parameter.callback; // For JSONP
  
  var result;
  
  try {
    switch(action) {
      case 'getData':
        var data = getData();
        result = { success: true, data: data };
        break;
      case 'getTakenJerseyNumbers':
        var numbers = [];
        if (typeof getTakenJerseyNumbers === 'function') {
          numbers = getTakenJerseyNumbers();
        }
        result = { success: true, data: numbers };
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }
  } catch (error) {
    Logger.log('handleAPIRequest ERROR: ' + error);
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

/**
 * Handle POST requests (for form submissions, file uploads)
 * Supports JSONP for CORS workaround
 */
function doPost(e) {
  try {
    var action = e.parameter.action;
    var callback = e.parameter.callback; // For JSONP
    var postData = {};
    
    // Parse POST data
    if (e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (parseError) {
        Logger.log('doPost: Error parsing POST data - ' + parseError);
        postData = {};
      }
    }
    
    var result;
    
    try {
      switch(action) {
        case 'uploadReceipt':
          if (typeof uploadReceipt === 'function') {
            result = uploadReceipt(
              postData.fileData,
              postData.playerName,
              postData.jerseyNumber
            );
          } else {
            result = { success: false, error: 'uploadReceipt function not found' };
          }
          break;
        case 'submitJerseyBooking':
          if (typeof submitJerseyBooking === 'function') {
            result = submitJerseyBooking(postData);
          } else {
            result = { success: false, error: 'submitJerseyBooking function not found' };
          }
          break;
        default:
          result = { success: false, error: 'Unknown action: ' + action };
      }
    } catch (error) {
      Logger.log('doPost ERROR: ' + error);
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
  } catch (error) {
    Logger.log('doPost: FATAL ERROR - ' + error);
    var errorResult = { success: false, error: error.toString() };
    return ContentService.createTextOutput(JSON.stringify(errorResult))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Include HTML file content (for client-side template inclusion)
 */
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * Get Players List HTML content (for dynamic loading)
 */
function getPlayersListContent() {
  var template = HtmlService.createTemplateFromFile('Index');
  var data = getData();
  template.initialData = data || [];
  return template.evaluate().getContent();
}

/**
 * getData
 * What: Fetches all player registration rows from the "Form Responses 1" sheet
 *        and maps them into a structured array of player objects.
 * Input: none (uses CONFIG.registrationSheetId)
 * Output: Player[] (array of plain JS objects ready for frontend consumption)
 * Side effects: none (read-only access to the sheet)
 * Errors: returns [] if sheet is missing or has no data; logs details for debugging.
 */
  function getData() {
  try {
    Logger.log('getData: start');
    Logger.log('getData: CONFIG = ' + JSON.stringify(typeof CONFIG !== 'undefined' ? CONFIG : {}));

    // Use the dedicated registration spreadsheet (configured in CONFIG) instead of the active sheet
    var registrationSheetId = typeof CONFIG !== 'undefined' && CONFIG.registrationSheetId;
    Logger.log('getData: registrationSheetId = ' + registrationSheetId);

    if (!registrationSheetId) {
      Logger.log('getData: registrationSheetId is missing. Returning empty array.');
      return [];
    }

    var registrationSpreadsheet = SpreadsheetApp.openById(registrationSheetId);
    Logger.log('getData: opened spreadsheet = ' + registrationSpreadsheet.getName());

    var sheet = registrationSpreadsheet.getSheetByName('Form Responses 1');
    Logger.log('getData: sheet = ' + (sheet ? sheet.getName() : 'NONE'));
    if (!sheet) {
      return []; // Return an empty array if the sheet is not found
    }

    var data = sheet.getDataRange().getValues();
    Logger.log('getData: rows (including header) = ' + data.length);
    if (data.length < 2) {
      return []; // Return an empty array if there is no data (only headers or empty sheet)
    }

    // Remove headers from data (we keep this in case we want to map by header later)
    var headers = data.shift();
    Logger.log('getData: headers = ' + JSON.stringify(headers));

    /**
     * transformImageUrl
     * What: Convert a Google Drive "open" link into a direct image URL for <img src>.
     * Input: rawUrl: string (may be empty or any URL)
     * Output: string (direct image URL or empty string / original URL if no ID found)
     * Side effects: none
     * Errors: none; falls back gracefully if pattern does not match.
     */
    function transformImageUrl(rawUrl) {
      if (!rawUrl) {
        return '';
      }

      // Try to extract fileId from typical Drive URLs, e.g.
      // - https://drive.google.com/open?id=FILE_ID
      // - https://drive.google.com/file/d/FILE_ID/view
      var idParamMatch = rawUrl.match(/[?&]id=([^&]+)/);
      var pathMatch = rawUrl.match(/\/d\/([-\w]{10,})/);
      var fileId = idParamMatch ? idParamMatch[1] : (pathMatch ? pathMatch[1] : null);

      if (!fileId) {
        // If we cannot confidently extract an ID, just return the original URL
        return rawUrl;
      }

      // Direct image URL that works in <img src="">
      return 'https://drive.google.com/uc?export=view&id=' + fileId;
    }

    var result = data.map(function (row, idx) {
      var player = {
        timestamp: row[0],
        email: row[1],
        name: row[2],
        age: row[3],
        parentName: row[4],
        parentPhone: row[5],
        address: row[6],
        school: row[7],
        skillLevel: row[8],
        achievement: row[9],
        parentConsent: row[10],
        imageUrl: transformImageUrl(row[11]) // Handle missing or non-standard image URLs
      };

      // Log a few first rows for verification
      if (idx < 3) {
        Logger.log('getData: sample player row ' + idx + ' = ' + JSON.stringify(player));
      }

      return player;
    });

    Logger.log('getData: returning ' + result.length + ' players');
    return result;
  } catch (e) {
    Logger.log('getData: ERROR = ' + e);
    return [];
  }
  }