/**
 * File: api.js
 * Purpose: API wrapper untuk call Apps Script endpoints dari Vercel
 * Notes: Apps Script Web Apps don't support CORS, so we use a workaround
 */

// Apps Script Web App URL (akan di-set dalam environment variable atau config)
const APPS_SCRIPT_URL = window.APPS_SCRIPT_URL || '';

/**
 * Call Apps Script API using JSONP workaround (for GET requests)
 * Apps Script Web Apps don't support CORS, so we use JSONP for GET requests
 */
function callAppsScriptAPIGET(action) {
  return new Promise((resolve, reject) => {
    // Create unique callback name
    const callbackName = 'callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Create script tag for JSONP
    const script = document.createElement('script');
    const url = APPS_SCRIPT_URL + '?action=' + encodeURIComponent(action) + 
                '&callback=' + callbackName;
    
    script.src = url;
    script.onerror = () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      delete window[callbackName];
      reject(new Error('Failed to load API'));
    };
    
    // Set up callback
    window[callbackName] = function(response) {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
      delete window[callbackName];
      resolve(response);
    };
    
    document.body.appendChild(script);
  });
}

/**
 * Call Apps Script API using form submission (for POST requests)
 * Apps Script Web Apps don't support CORS, so we use hidden form + iframe for POST
 */
function callAppsScriptAPIPOST(action, data = {}) {
  return new Promise((resolve, reject) => {
    // Create unique callback name
    const callbackName = 'callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Create hidden iframe
    const iframe = document.createElement('iframe');
    iframe.name = 'hidden_iframe_' + callbackName;
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    
    // Set up callback listener
    window[callbackName] = function(response) {
      document.body.removeChild(iframe);
      delete window[callbackName];
      resolve(response);
    };
    
    // Create form
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = APPS_SCRIPT_URL + '?action=' + encodeURIComponent(action) + '&callback=' + callbackName;
    form.target = iframe.name;
    form.style.display = 'none';
    
    // Add data as hidden input
    const dataInput = document.createElement('input');
    dataInput.type = 'hidden';
    dataInput.name = 'data';
    dataInput.value = JSON.stringify(data);
    form.appendChild(dataInput);
    
    document.body.appendChild(form);
    
    // Submit form
    form.submit();
    
    // Clean up form after submission
    setTimeout(() => {
      if (document.body.contains(form)) {
        document.body.removeChild(form);
      }
    }, 100);
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
        delete window[callbackName];
        reject(new Error('Request timeout'));
      }
    }, 30000);
  });
}

/**
 * API helper functions
 */
const API = {
  /**
   * Get player data
   */
  getData: async function() {
    if (!APPS_SCRIPT_URL) {
      // Fallback: try to load from Apps Script if running in Apps Script context
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        return new Promise((resolve, reject) => {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .getData();
        });
      }
      throw new Error('APPS_SCRIPT_URL not configured');
    }
    return callAppsScriptAPIGET('getData');
  },

  /**
   * Get taken jersey numbers
   */
  getTakenJerseyNumbers: async function() {
    if (!APPS_SCRIPT_URL) {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        return new Promise((resolve, reject) => {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .getTakenJerseyNumbers();
        });
      }
      throw new Error('APPS_SCRIPT_URL not configured');
    }
    return callAppsScriptAPIGET('getTakenJerseyNumbers');
  },

  /**
   * Upload receipt (POST request)
   */
  uploadReceipt: async function(fileData, playerName, jerseyNumber) {
    if (!APPS_SCRIPT_URL) {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        return new Promise((resolve, reject) => {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .uploadReceipt(fileData, playerName, jerseyNumber);
        });
      }
      throw new Error('APPS_SCRIPT_URL not configured');
    }
    return callAppsScriptAPIPOST('uploadReceipt', { fileData, playerName, jerseyNumber });
  },

  /**
   * Submit jersey booking (POST request)
   */
  submitJerseyBooking: async function(bookingData) {
    if (!APPS_SCRIPT_URL) {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        return new Promise((resolve, reject) => {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .submitJerseyBooking(bookingData);
        });
      }
      throw new Error('APPS_SCRIPT_URL not configured');
    }
    return callAppsScriptAPIPOST('submitJerseyBooking', bookingData);
  },

  /**
   * Search players by email (GET request)
   */
  searchByEmail: async function(email) {
    if (!APPS_SCRIPT_URL) {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        return new Promise((resolve, reject) => {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .searchByEmail(email);
        });
      }
      throw new Error('APPS_SCRIPT_URL not configured');
    }
    // For GET requests with additional parameters, append to URL
    return new Promise((resolve, reject) => {
      const callbackName = 'callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const script = document.createElement('script');
      const url = APPS_SCRIPT_URL + '?action=searchByEmail&email=' + encodeURIComponent(email) + 
                  '&callback=' + callbackName;
      script.src = url;
      script.onerror = () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
        delete window[callbackName];
        reject(new Error('Failed to load API'));
      };
      window[callbackName] = function(response) {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
        delete window[callbackName];
        resolve(response);
      };
      document.body.appendChild(script);
    });
  },

  /**
   * Get player by row index (GET request)
   */
  getPlayerById: async function(rowIndex) {
    if (!APPS_SCRIPT_URL) {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        return new Promise((resolve, reject) => {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .getPlayerById(rowIndex);
        });
      }
      throw new Error('APPS_SCRIPT_URL not configured');
    }
    return new Promise((resolve, reject) => {
      const callbackName = 'callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const script = document.createElement('script');
      const url = APPS_SCRIPT_URL + '?action=getPlayerById&rowIndex=' + encodeURIComponent(rowIndex) + 
                  '&callback=' + callbackName;
      script.src = url;
      script.onerror = () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
        delete window[callbackName];
        reject(new Error('Failed to load API'));
      };
      window[callbackName] = function(response) {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
        delete window[callbackName];
        resolve(response);
      };
      document.body.appendChild(script);
    });
  },

  /**
   * Update player (POST request)
   */
  updatePlayer: async function(rowIndex, playerData) {
    if (!APPS_SCRIPT_URL) {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        return new Promise((resolve, reject) => {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .updatePlayer(rowIndex, playerData);
        });
      }
      throw new Error('APPS_SCRIPT_URL not configured');
    }
    return callAppsScriptAPIPOST('updatePlayer', { rowIndex: rowIndex, playerData: playerData });
  },

  /**
   * Delete player (POST request)
   */
  deletePlayer: async function(rowIndex, email) {
    if (!APPS_SCRIPT_URL) {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        return new Promise((resolve, reject) => {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .deletePlayer(rowIndex, email);
        });
      }
      throw new Error('APPS_SCRIPT_URL not configured');
    }
    return callAppsScriptAPIPOST('deletePlayer', { rowIndex: rowIndex, email: email });
  },

  /**
   * Add new player (POST request)
   */
  addPlayer: async function(playerData) {
    if (!APPS_SCRIPT_URL) {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        return new Promise((resolve, reject) => {
          google.script.run
            .withSuccessHandler(resolve)
            .withFailureHandler(reject)
            .addPlayer(playerData);
        });
      }
      throw new Error('APPS_SCRIPT_URL not configured');
    }
    return callAppsScriptAPIPOST('addPlayer', { playerData: playerData });
  }
};
