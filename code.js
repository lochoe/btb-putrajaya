/**
 * File: code.js
 * Purpose: (Unused) Previously contained receipt generation logic. Left intentionally empty.
 */
function generateReceiptsFromTemplate() {
    try {
      const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(CONFIG.sheetName);
      const data = sheet.getDataRange().getValues(); // Get all data from the sheet
      const folder = DriveApp.getFolderById(CONFIG.folderId);
      const templateId = CONFIG.templateId;
  
      console.log("Starting receipt generation...");
      console.log(`Fetched ${data.length - 1} rows (excluding headers) from sheet.`);
  
      // Get headers and rows
      const headers = data[0];
      const rows = data.slice(1); // Skip the header row
  
      // Determine the next sequential No Resit
      let nextResitNumber = calculateNextResitNumber(rows);
  
      // Process all rows
      rows.forEach((row, index) => {
        console.log(`Processing row ${index + 1}: ${JSON.stringify(row)}`);
        const [no, tarikh, pembayar, tujuan, pemain, jumlah, noResit] = row;
  
        // Generate No Resit if missing (e.g., BTB-0001, BTB-0002, ...)
        const uniqueResit = noResit || generateSequentialResit(nextResitNumber++);
        console.log(`Generated No Resit: ${uniqueResit}`);
  
        // Format the date (dd-mm-yyyy)
        const formattedTarikh = tarikh ? formatDate(tarikh) : "N/A";
        console.log(`Formatted date: ${formattedTarikh}`);
  
        // Create a copy of the template
        const doc = DriveApp.getFileById(templateId).makeCopy(`Receipt_${uniqueResit}`, folder);
        const docId = doc.getId();
        const docBody = DocumentApp.openById(docId).getBody();
  
        // Replace placeholders with actual data
        docBody.replaceText("{{no}}", no || "N/A");
        docBody.replaceText("{{noResit}}", uniqueResit);
        docBody.replaceText("{{tarikh}}", formattedTarikh);
        docBody.replaceText("{{pembayar}}", pembayar || "N/A");
        docBody.replaceText("{{tujuan}}", tujuan || "N/A");
        docBody.replaceText("{{pemain}}", pemain || "N/A");
        docBody.replaceText("{{jumlah}}", jumlah || "N/A");
  
        // Save changes
        DocumentApp.openById(docId).saveAndClose();
  
        // Export the document as a PDF
        const pdfBlob = DriveApp.getFileById(docId).getAs("application/pdf");
        const pdfFile = folder.createFile(pdfBlob).setName(`Receipt_${uniqueResit}.pdf`);
        console.log(`Generated PDF: ${pdfFile.getName()} at ${pdfFile.getUrl()}`);
  
        // Delete the intermediate Google Doc
        DriveApp.getFileById(docId).setTrashed(true); // Moves the Google Doc to the trash
        console.log(`Deleted intermediate Google Doc: ${docId}`);
  
        // Update the sheet with the generated No Resit and link
        const resitColumn = headers.indexOf("No Resit") + 1;
        const linkColumn = headers.length + 1; // Next column after the last header
  
        sheet.getRange(index + 2, resitColumn).setValue(uniqueResit); // Update No Resit
        const pdfUrl = pdfFile.getUrl();
        sheet.getRange(index + 2, linkColumn).setFormula(`=HYPERLINK("${pdfUrl}", "Download PDF")`); // Add clickable link
  
        console.log(`Row ${index + 1} updated with No Resit and PDF link.`);
      });
  
      console.log("Receipt generation completed for all rows.");
      SpreadsheetApp.flush(); // Ensure all changes are saved
  
    } catch (error) {
      console.error("Error during receipt generation:", error.message);
      throw error; // Ensure errors are visible in execution logs
    }
  }
  
  function calculateNextResitNumber(rows) {
    // Find the highest existing No Resit and determine the next number
    let maxNumber = 0;
    rows.forEach(row => {
      const noResit = row[6]; // Column index of "No Resit"
      if (noResit && noResit.startsWith("BTB-")) {
        const number = parseInt(noResit.replace("BTB-", ""), 10);
        if (!isNaN(number)) {
          maxNumber = Math.max(maxNumber, number);
        }
      }
    });
    return maxNumber + 1;
  }
  
  function generateSequentialResit(number) {
    // Format the number as BTB-0001, BTB-0002, etc.
    return `BTB-${String(number).padStart(4, "0")}`;
  }
  
  function formatDate(date) {
    // Convert a date object or string to dd-mm-yyyy format
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
  