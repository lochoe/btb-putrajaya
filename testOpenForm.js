function testOpenForm() {
    try {
      const form = FormApp.openById(CONFIG.attendanceFormId);
      Logger.log('Form Title: ' + form.getTitle());
    } catch (error) {
      Logger.log('Error opening form: ' + error);
    }
  }