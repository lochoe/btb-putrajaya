/**
 * File: config.example.js
 * Purpose: Template configuration file for BTB Putrajaya Apps Script project
 * Usage: Copy this file to config.js and fill in your actual values
 * Notes: config.js is gitignored to protect sensitive IDs
 */

const CONFIG = {
    sheetName: "Cashflow", // Replace with your sheet name
    folderId: "YOUR_FOLDER_ID_HERE", // Replace with your folder ID
    templateId: "YOUR_TEMPLATE_ID_HERE", // Replace with your Google Docs template ID
    registrationSheetId: 'YOUR_REGISTRATION_SHEET_ID_HERE', // Replace with your actual Registration Sheet ID
    attendanceFormId: 'YOUR_ATTENDANCE_FORM_ID_HERE',       // Replace with your actual Attendance Form ID
    jerseyFormId: '', // TODO: Paste Form ID selepas buat Google Form untuk tempah baju
    jerseySheetId: '', // TODO: Paste Sheet ID (akan auto-create bila submit form pertama)
    adminEmail: 'your-email@gmail.com',                   // Replace with your actual admin email
  };
