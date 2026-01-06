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
      case 'searchByEmail':
        var email = e.parameter.email;
        var players = searchByEmail(email);
        result = { success: true, data: players };
        break;
      case 'getPlayerById':
        var rowIndex = parseInt(e.parameter.rowIndex);
        var player = getPlayerById(rowIndex);
        result = { success: true, data: player };
        break;
      default:
        result = { success: false, error: 'Unknown action: ' + action };
    }
  } catch (error) {
    Logger.log('handleAPIRequest ERROR: ' + error);
    result = { success: false, error: error.toString() };
  }
  
  // Log result for debugging
  Logger.log('handleAPIRequest: action=' + action + ', callback=' + callback);
  Logger.log('handleAPIRequest: result=' + JSON.stringify(result).substring(0, 200));
  
  // Return JSONP if callback specified, otherwise JSON
  if (callback) {
    var jsonpResponse = callback + '(' + JSON.stringify(result) + ');';
    Logger.log('handleAPIRequest: returning JSONP, length=' + jsonpResponse.length);
    return ContentService.createTextOutput(jsonpResponse)
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
    var callback = e.parameter.callback; // For JSONP callback
    var postData = {};
    
    // Parse POST data - handle both JSON and form-encoded data
    if (e.postData) {
      if (e.postData.contents) {
        try {
          postData = JSON.parse(e.postData.contents);
        } catch (parseError) {
          // Try parsing as form data
          try {
            var formData = e.postData.contents;
            if (formData.indexOf('data=') !== -1) {
              var dataMatch = formData.match(/data=([^&]*)/);
              if (dataMatch) {
                postData = JSON.parse(decodeURIComponent(dataMatch[1]));
              }
            }
          } catch (formError) {
            Logger.log('doPost: Error parsing POST data - ' + formError);
            postData = {};
          }
        }
      } else if (e.parameter.data) {
        // Data passed as parameter
        try {
          postData = JSON.parse(e.parameter.data);
        } catch (parseError) {
          Logger.log('doPost: Error parsing parameter data - ' + parseError);
          postData = {};
        }
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
        case 'updatePlayer':
          var rowIndex = postData.rowIndex ? parseInt(postData.rowIndex) : null;
          var playerData = postData.playerData || postData;
          if (rowIndex === null) {
            result = { success: false, error: 'rowIndex is required' };
          } else {
            result = updatePlayer(rowIndex, playerData);
          }
          break;
        case 'deletePlayer':
          var rowIndexToDelete = postData.rowIndex ? parseInt(postData.rowIndex) : null;
          var confirmEmail = postData.email || postData.confirmEmail;
          if (rowIndexToDelete === null || !confirmEmail) {
            result = { success: false, error: 'rowIndex and email are required' };
          } else {
            result = deletePlayer(rowIndexToDelete, confirmEmail);
          }
          break;
        case 'addPlayer':
          var newPlayerData = postData.playerData || postData;
          result = addPlayer(newPlayerData);
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
      // rowIndex is 1-based in Google Sheets (row 1 = headers, row 2 = first data)
      var rowIndex = idx + 2;
      
      var player = {
        rowIndex: rowIndex,
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
        imageUrl: transformImageUrl(row[11]), // Handle missing or non-standard image URLs
        icNumber: row[12] || '' // IC number (may not exist in old data)
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

/**
 * searchByEmail
 * What: Search for players by email address
 * Input: email: string
 * Output: Player[] (array of players with matching email)
 * Side effects: none (read-only)
 * Errors: returns [] on error
 */
function searchByEmail(email) {
  try {
    if (!email) {
      return [];
    }

    var allPlayers = getData();
    var emailLower = email.toLowerCase().trim();
    
    var filtered = allPlayers.filter(function(player) {
      return player.email && player.email.toLowerCase().trim() === emailLower;
    });

    Logger.log('searchByEmail: found ' + filtered.length + ' players for email ' + email);
    return filtered;
  } catch (e) {
    Logger.log('searchByEmail: ERROR = ' + e);
    return [];
  }
}

/**
 * getPlayerById
 * What: Get a single player by row index
 * Input: rowIndex: number (1-based row number in Google Sheets)
 * Output: Player object or null
 * Side effects: none (read-only)
 * Errors: returns null on error
 */
function getPlayerById(rowIndex) {
  try {
    if (!rowIndex || rowIndex < 2) {
      Logger.log('getPlayerById: invalid rowIndex ' + rowIndex);
      return null;
    }

    var registrationSheetId = typeof CONFIG !== 'undefined' && CONFIG.registrationSheetId;
    if (!registrationSheetId) {
      Logger.log('getPlayerById: registrationSheetId missing');
      return null;
    }

    var spreadsheet = SpreadsheetApp.openById(registrationSheetId);
    var sheet = spreadsheet.getSheetByName('Form Responses 1');
    
    if (!sheet) {
      Logger.log('getPlayerById: sheet not found');
      return null;
    }

    var row = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
    if (!row || row.length === 0) {
      Logger.log('getPlayerById: row ' + rowIndex + ' not found or empty');
      return null;
    }

    // Transform image URL
    function transformImageUrl(rawUrl) {
      if (!rawUrl) return '';
      var idParamMatch = rawUrl.match(/[?&]id=([^&]+)/);
      var pathMatch = rawUrl.match(/\/d\/([-\w]{10,})/);
      var fileId = idParamMatch ? idParamMatch[1] : (pathMatch ? pathMatch[1] : null);
      return fileId ? 'https://drive.google.com/uc?export=view&id=' + fileId : rawUrl;
    }

    var player = {
      rowIndex: rowIndex,
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
      imageUrl: transformImageUrl(row[11]),
      icNumber: row[12] || ''
    };

    Logger.log('getPlayerById: returning player ' + rowIndex);
    return player;
  } catch (e) {
    Logger.log('getPlayerById: ERROR = ' + e);
    return null;
  }
}

/**
 * updatePlayer
 * What: Update player information in Google Sheets
 * Input: rowIndex: number, playerData: object
 * Output: {success: boolean, message?: string}
 * Side effects: writes to Google Sheets
 * Errors: returns {success: false, message: "..."}
 */
function updatePlayer(rowIndex, playerData) {
  try {
    if (!rowIndex || rowIndex < 2) {
      return { success: false, message: 'Invalid row index' };
    }

    var registrationSheetId = typeof CONFIG !== 'undefined' && CONFIG.registrationSheetId;
    if (!registrationSheetId) {
      return { success: false, message: 'Configuration error: registrationSheetId missing' };
    }

    var spreadsheet = SpreadsheetApp.openById(registrationSheetId);
    var sheet = spreadsheet.getSheetByName('Form Responses 1');
    
    if (!sheet) {
      return { success: false, message: 'Sheet not found' };
    }

    // Verify row exists
    if (rowIndex > sheet.getLastRow()) {
      return { success: false, message: 'Row not found' };
    }

    // Get current row to preserve timestamp and email
    var currentRow = sheet.getRange(rowIndex, 1, 1, sheet.getLastColumn()).getValues()[0];
    
    // Update row data (preserve timestamp[0] and email[1])
    var newRow = [
      currentRow[0], // timestamp - preserve original
      playerData.email || currentRow[1], // email - update if provided, otherwise preserve
      playerData.name || '',
      playerData.age || '',
      playerData.parentName || '',
      playerData.parentPhone || '',
      playerData.address || '',
      playerData.school || '',
      playerData.skillLevel || '',
      playerData.achievement || '',
      playerData.parentConsent || '',
      currentRow[11] || '', // imageUrl - preserve original
      playerData.icNumber || '' // icNumber - new column
    ];

    // Write to sheet (starting from column 1)
    sheet.getRange(rowIndex, 1, 1, newRow.length).setValues([newRow]);
    SpreadsheetApp.flush();

    Logger.log('updatePlayer: updated row ' + rowIndex);
    return { success: true, message: 'Maklumat pemain berjaya dikemaskini' };
  } catch (e) {
    Logger.log('updatePlayer: ERROR = ' + e);
    return { success: false, message: 'Ralat: ' + e.toString() };
  }
}

/**
 * deletePlayer
 * What: Delete a player row from Google Sheets (with email confirmation)
 * Input: rowIndex: number, email: string (for confirmation)
 * Output: {success: boolean, message?: string}
 * Side effects: deletes row from Google Sheets
 * Errors: returns {success: false, message: "..."}
 */
function deletePlayer(rowIndex, email) {
  try {
    if (!rowIndex || rowIndex < 2) {
      return { success: false, message: 'Invalid row index' };
    }

    if (!email) {
      return { success: false, message: 'Email diperlukan untuk pengesahan' };
    }

    var registrationSheetId = typeof CONFIG !== 'undefined' && CONFIG.registrationSheetId;
    if (!registrationSheetId) {
      return { success: false, message: 'Configuration error: registrationSheetId missing' };
    }

    var spreadsheet = SpreadsheetApp.openById(registrationSheetId);
    var sheet = spreadsheet.getSheetByName('Form Responses 1');
    
    if (!sheet) {
      return { success: false, message: 'Sheet not found' };
    }

    // Verify row exists and email matches
    if (rowIndex > sheet.getLastRow()) {
      return { success: false, message: 'Row not found' };
    }

    var currentRow = sheet.getRange(rowIndex, 1, 1, 2).getValues()[0];
    var currentEmail = (currentRow[1] || '').toLowerCase().trim();
    var confirmEmail = email.toLowerCase().trim();

    if (currentEmail !== confirmEmail) {
      return { success: false, message: 'Email tidak sepadan. Padaman dibatalkan.' };
    }

    // Delete the row
    sheet.deleteRow(rowIndex);
    SpreadsheetApp.flush();

    Logger.log('deletePlayer: deleted row ' + rowIndex);
    return { success: true, message: 'Pemain berjaya dipadam' };
  } catch (e) {
    Logger.log('deletePlayer: ERROR = ' + e);
    return { success: false, message: 'Ralat: ' + e.toString() };
  }
}

/**
 * addPlayer
 * What: Add a new player row to Google Sheets
 * Input: playerData: object
 * Output: {success: boolean, rowIndex?: number, message?: string}
 * Side effects: adds new row to Google Sheets
 * Errors: returns {success: false, message: "..."}
 */
function addPlayer(playerData) {
  try {
    if (!playerData) {
      return { success: false, message: 'Data pemain diperlukan' };
    }

    var registrationSheetId = typeof CONFIG !== 'undefined' && CONFIG.registrationSheetId;
    if (!registrationSheetId) {
      return { success: false, message: 'Configuration error: registrationSheetId missing' };
    }

    var spreadsheet = SpreadsheetApp.openById(registrationSheetId);
    var sheet = spreadsheet.getSheetByName('Form Responses 1');
    
    if (!sheet) {
      return { success: false, message: 'Sheet not found' };
    }

    // Prepare new row
    var timestamp = new Date();
    var newRow = [
      timestamp, // timestamp
      playerData.email || '',
      playerData.name || '',
      playerData.age || '',
      playerData.parentName || '',
      playerData.parentPhone || '',
      playerData.address || '',
      playerData.school || '',
      playerData.skillLevel || '',
      playerData.achievement || '',
      playerData.parentConsent || '',
      '', // imageUrl - empty for new player
      playerData.icNumber || '' // icNumber
    ];

    // Append new row
    sheet.appendRow(newRow);
    SpreadsheetApp.flush();

    // Get the row index of the newly added row
    var newRowIndex = sheet.getLastRow();

    Logger.log('addPlayer: added new player at row ' + newRowIndex);
    return { 
      success: true, 
      rowIndex: newRowIndex,
      message: 'Pemain baru berjaya ditambah' 
    };
  } catch (e) {
    Logger.log('addPlayer: ERROR = ' + e);
    return { success: false, message: 'Ralat: ' + e.toString() };
  }
}