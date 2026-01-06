/**
 * File: api.js
 * Purpose: API wrapper untuk call Apps Script endpoints dari Vercel
 * Notes: Apps Script Web Apps don't support CORS, so we use a workaround
 */

// Apps Script Web App URL (akan di-set dalam environment variable atau config)
const APPS_SCRIPT_URL = window.APPS_SCRIPT_URL || '';

/**
 * Call Apps Script API using JSONP workaround
 * Apps Script Web Apps don't support CORS, so we use a workaround with callback
 */
function callAppsScriptAPI(action, data = {}) {
  return new Promise((resolve, reject) => {
    // Create unique callback name
    const callbackName = 'callback_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    // Create script tag for JSONP
    const script = document.createElement('script');
    const url = APPS_SCRIPT_URL + '?action=' + encodeURIComponent(action) + 
                '&callback=' + callbackName + 
                '&data=' + encodeURIComponent(JSON.stringify(data));
    
    script.src = url;
    script.onerror = () => {
      document.body.removeChild(script);
      delete window[callbackName];
      reject(new Error('Failed to load API'));
    };
    
    // Set up callback
    window[callbackName] = function(response) {
      document.body.removeChild(script);
      delete window[callbackName];
      resolve(response);
    };
    
    document.body.appendChild(script);
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
    return callAppsScriptAPI('getData');
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
    return callAppsScriptAPI('getTakenJerseyNumbers');
  },

  /**
   * Upload receipt
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
    return callAppsScriptAPI('uploadReceipt', { fileData, playerName, jerseyNumber });
  },

  /**
   * Submit jersey booking
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
    return callAppsScriptAPI('submitJerseyBooking', bookingData);
  }
};
