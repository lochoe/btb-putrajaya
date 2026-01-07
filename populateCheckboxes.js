// populateCheckboxes.gs

/**
 * Updates the "Nama Penuh Pelatih" checkboxes in the Attendance Form
 * based on the registered children from the Registration Sheet.
 */
function updateChildNamesCheckboxes() {
    // Access configuration variables from config.gs
    const registrationSheetId = CONFIG.registrationSheetId;
    const attendanceFormId = CONFIG.attendanceFormId;
    
    Logger.log("Attendance Form ID: " + attendanceFormId);
    
    // Open the registration sheet
    const registrationSpreadsheet = SpreadsheetApp.openById(registrationSheetId);
    const registrationSheet = registrationSpreadsheet.getSheetByName('Form Responses 1'); // Adjust if different
  
    // Get all registered children names from "Nama Penuh Pelatih" column (Column C)
    const data = registrationSheet.getDataRange().getValues();
    const headers = data[0];
    const namaPelatihIndex = headers.indexOf('Nama Penuh Pelatih');
  
    if (namaPelatihIndex === -1) {
      Logger.log("Column 'Nama Penuh Pelatih' not found in Registration Sheet.");
      return;
    }
  
    const childNamesSet = new Set();
  
    // Start from row 2 to skip headers
    for (let i = 1; i < data.length; i++) {
      const childName = data[i][namaPelatihIndex];
      if (childName) {
        childNamesSet.add(childName);
      }
    }
  
    const childNames = Array.from(childNamesSet).sort();
  
    // Open the attendance form
    try {
      const form = FormApp.openById(attendanceFormId);
      Logger.log("Attendance Form opened successfully.");
      
      // Find the "Nama Penuh Pelatih" checkbox item
      const items = form.getItems(FormApp.ItemType.CHECKBOX);
      let childNameItem = null;
  
      for (let j = 0; j < items.length; j++) {
        if (items[j].getTitle() === "Nama Penuh Pelatih") { // Updated title
          childNameItem = items[j].asCheckboxItem();
          break;
        }
      }
  
      if (childNameItem) {
        // Create choices from childNames array
        const choices = childNames.map(name => childNameItem.createChoice(name));
  
        // Update the checkbox with new choices
        childNameItem.setChoices(choices);
  
        Logger.log("Nama Penuh Pelatih checkboxes updated successfully.");
      } else {
        Logger.log("Nama Penuh Pelatih checkbox not found in the Attendance Form.");
      }
    } catch (error) {
      Logger.log("Error opening Attendance Form: " + error);
    }
  }
  
  /**
   * Creates a time-driven trigger to update the checkboxes daily.
   */
  function createTimeDrivenTriggerForCheckboxes() {
    ScriptApp.newTrigger('updateChildNamesCheckboxes')
      .timeBased()
      .everyDays(1)
      .atHour(1) // Runs at 1 AM daily; adjust as needed
      .create();
  }
  