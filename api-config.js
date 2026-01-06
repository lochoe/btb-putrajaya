/**
 * File: api-config.js
 * Purpose: Configuration for Apps Script API endpoints
 * Usage: Set APPS_SCRIPT_WEB_APP_URL to your deployed Apps Script Web App URL
 * Notes: This file should be updated with your actual Apps Script deployment URL
 */

// Replace with your Apps Script Web App URL (from Deploy > Web app)
// Example: 'https://script.google.com/macros/s/AKfycby.../exec'
const APPS_SCRIPT_WEB_APP_URL = 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE';

// API helper functions
const AppsScriptAPI = {
  /**
   * Call Apps Script API endpoint
   * @param {string} action - API action (e.g., 'getData', 'getTakenJerseyNumbers', 'uploadReceipt', 'submitJerseyBooking')
   * @param {object} data - Data to send (optional)
   * @returns {Promise} Promise that resolves with API response
   */
  call: async function(action, data = {}) {
    if (!APPS_SCRIPT_WEB_APP_URL || APPS_SCRIPT_WEB_APP_URL === 'YOUR_APPS_SCRIPT_WEB_APP_URL_HERE') {
      throw new Error('APPS_SCRIPT_WEB_APP_URL not configured. Please set it in api-config.js');
    }

    const url = APPS_SCRIPT_WEB_APP_URL + '?action=' + encodeURIComponent(action);
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
        mode: 'no-cors' // Apps Script Web Apps don't support CORS, so we use no-cors
      });

      // Note: With no-cors, we can't read response body directly
      // Apps Script will need to handle this differently
      // For now, we'll use a workaround with iframe or form submission
      return response;
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  },

  /**
   * Get player data
   */
  getData: async function() {
    return this.call('getData');
  },

  /**
   * Get taken jersey numbers
   */
  getTakenJerseyNumbers: async function() {
    return this.call('getTakenJerseyNumbers');
  },

  /**
   * Upload receipt file
   */
  uploadReceipt: async function(fileData, playerName, jerseyNumber) {
    return this.call('uploadReceipt', { fileData, playerName, jerseyNumber });
  },

  /**
   * Submit jersey booking
   */
  submitJerseyBooking: async function(bookingData) {
    return this.call('submitJerseyBooking', bookingData);
  }
};
