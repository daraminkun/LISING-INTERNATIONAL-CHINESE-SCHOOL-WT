import { Student } from '../types';
import { formatDobOnly } from '../utils/ageUtils';

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * Google Apps Script Backend for Student Management System
 * ប្រព័ន្ធគ្រប់គ្រងសិស្ស - Google Sheets Backend
 * 
 * Instructions:
 * 1. Open your Google Sheet
 * 2. Click Extensions > Apps Script
 * 3. Replace all code in Code.gs with this script
 * 4. Click "Deploy" > "New deployment"
 * 5. Select type: "Web app"
 * 6. Description: "Student Management API v2"
 * 7. Execute as: "Me"
 * 8. Who has access: "Anyone"
 * 9. Click Deploy, authorize access, and copy the Web App URL!
 */

const SHEET_NAME = "Students";

const HEADERS = [
  "No", 
  "NameKhmer", 
  "NameLatin", 
  "NameChinese", 
  "Gender", 
  "DOB", 
  "PlaceOfBirth", 
  "IdCardNumber", 
  "PassportNumber", 
  "Phone", 
  "CurrentAddress", 
  "FatherNameEnglish", 
  "FatherNameChinese", 
  "FatherDob", 
  "FatherPhone", 
  "MotherNameEnglish", 
  "MotherNameChinese", 
  "MotherDob", 
  "MotherPhone", 
  "PreviousSchoolKhmer", 
  "TargetSchool", 
  "Major", 
  "CreatedAt", 
  "Notes"
];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold").setBackground("#EEF2F6");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function studentToRow(s) {
  return [
    s.studentId || "",
    s.nameKhmer || s.name || "",
    s.nameLatin || "",
    s.nameChinese || "",
    s.gender || "Male",
    s.dob || "",
    s.placeOfBirth || "",
    s.idCardNumber || "",
    s.passportNumber || "",
    s.phone || "",
    s.currentAddress || "",
    s.fatherNameEnglish || "",
    s.fatherNameChinese || "",
    s.fatherDob || "",
    s.fatherPhone || "",
    s.motherNameEnglish || "",
    s.motherNameChinese || "",
    s.motherDob || "",
    s.motherPhone || "",
    s.previousSchoolKhmer || "",
    s.targetSchool || "",
    s.major || "",
    s.createdAt || new Date().toISOString(),
    s.notes || ""
  ];
}

// Handle GET requests (Fetch students or Ping)
function doGet(e) {
  try {
    const action = e.parameter.action || "read";
    const sheet = getOrCreateSheet();

    if (action === "ping") {
      return responseJSON({
        success: true,
        message: "Google Apps Script is online and connected!",
        timestamp: new Date().toISOString()
      });
    }

    // Read all rows
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) {
      return responseJSON({ success: true, data: [] });
    }

    const students = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue; // skip empty rows

      // New 24-column layout
      if (row.length >= 22) {
        students.push({
          studentId: String(row[0] || ""),
          nameKhmer: String(row[1] || ""),
          nameLatin: String(row[2] || ""),
          nameChinese: String(row[3] || ""),
          gender: String(row[4] || "Male"),
          dob: row[5] ? String(row[5]) : "",
          placeOfBirth: String(row[6] || ""),
          idCardNumber: String(row[7] || ""),
          passportNumber: String(row[8] || ""),
          phone: String(row[9] || ""),
          currentAddress: String(row[10] || ""),
          fatherNameEnglish: String(row[11] || ""),
          fatherNameChinese: String(row[12] || ""),
          fatherDob: row[13] ? String(row[13]) : "",
          fatherPhone: String(row[14] || ""),
          motherNameEnglish: String(row[15] || ""),
          motherNameChinese: String(row[16] || ""),
          motherDob: row[17] ? String(row[17]) : "",
          motherPhone: String(row[18] || ""),
          previousSchoolKhmer: String(row[19] || ""),
          targetSchool: String(row[20] || ""),
          major: String(row[21] || ""),
          createdAt: row[22] ? String(row[22]) : new Date().toISOString(),
          notes: row[23] ? String(row[23]) : "",
          name: String(row[1] || row[2] || "")
        });
      } else if (row.length >= 18) {
        // Fallback for previous 20-column layout
        students.push({
          studentId: String(row[0] || ""),
          nameKhmer: String(row[1] || ""),
          nameLatin: String(row[2] || ""),
          nameChinese: String(row[3] || ""),
          gender: String(row[4] || "Male"),
          dob: row[5] ? String(row[5]) : "",
          placeOfBirth: String(row[6] || ""),
          idCardNumber: String(row[7] || ""),
          passportNumber: String(row[8] || ""),
          fatherNameEnglish: String(row[9] || ""),
          fatherNameChinese: String(row[10] || ""),
          fatherDob: row[11] ? String(row[11]) : "",
          previousSchoolKhmer: String(row[12] || ""),
          targetSchool: String(row[13] || ""),
          major: String(row[14] || ""),
          currentAddress: String(row[15] || ""),
          phone: String(row[16] || ""),
          createdAt: row[18] ? String(row[18]) : new Date().toISOString(),
          notes: row[19] ? String(row[19]) : "",
          name: String(row[1] || row[2] || "")
        });
      } else {
        // Fallback for minimal legacy format
        students.push({
          studentId: String(row[0] || ""),
          nameKhmer: String(row[1] || ""),
          nameLatin: String(row[1] || ""),
          nameChinese: "",
          gender: String(row[2] || "Male"),
          dob: "",
          phone: String(row[3] || ""),
          currentAddress: "",
          createdAt: new Date().toISOString(),
          name: String(row[1] || "")
        });
      }
    }

    return responseJSON({ success: true, data: students });

  } catch (error) {
    return responseJSON({
      success: false,
      error: error.toString()
    });
  }
}

// Handle POST requests (Create, Update, Delete, SyncAll)
function doPost(e) {
  try {
    let payload = {};
    if (e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    const action = payload.action;
    const sheet = getOrCreateSheet();
    const data = sheet.getDataRange().getValues();

    if (action === "create") {
      const s = payload.student;
      if (!s) throw new Error("Missing student data");

      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === String(s.studentId).trim()) {
          throw new Error("Student with order number " + s.studentId + " already exists");
        }
      }

      sheet.appendRow(studentToRow(s));

      return responseJSON({
        success: true,
        message: "Student created successfully",
        student: s
      });
    }

    if (action === "update") {
      const s = payload.student;
      if (!s || !s.studentId) {
        throw new Error("Missing student information");
      }

      let found = false;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === String(s.studentId).trim()) {
          const rowIdx = i + 1;
          const updatedRow = studentToRow(s);
          sheet.getRange(rowIdx, 1, 1, updatedRow.length).setValues([updatedRow]);
          found = true;
          break;
        }
      }

      if (!found) {
        throw new Error("Student order number not found: " + s.studentId);
      }

      return responseJSON({
        success: true,
        message: "Student updated successfully"
      });
    }

    if (action === "delete") {
      const studentId = payload.studentId;
      if (!studentId) {
        throw new Error("Missing studentId parameter");
      }

      let found = false;
      for (let i = 1; i < data.length; i++) {
        if (String(data[i][0]).trim() === String(studentId).trim()) {
          sheet.deleteRow(i + 1);
          found = true;
          break;
        }
      }

      if (!found) {
        throw new Error("Student order number not found: " + studentId);
      }

      return responseJSON({
        success: true,
        message: "Student deleted successfully"
      });
    }

    if (action === "syncAll") {
      const students = payload.students || [];
      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
      }

      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

      if (students.length > 0) {
        const rows = students.map(s => studentToRow(s));
        sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
      }

      return responseJSON({
        success: true,
        message: "Synced " + students.length + " students successfully"
      });
    }

    throw new Error("Unknown action: " + action);

  } catch (error) {
    return responseJSON({
      success: false,
      error: error.toString()
    });
  }
}

function responseJSON(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
`;

export class AppsScriptService {
  private static sendRequest(url: string, payload: any): Promise<any> {
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    }).then(async res => {
      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }
      return res.json();
    });
  }

  static async ping(webAppUrl: string): Promise<{ success: boolean; message?: string }> {
    if (!webAppUrl || !webAppUrl.startsWith('http')) {
      throw new Error('Invalid URL');
    }
    const pingUrl = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}action=ping`;
    const res = await fetch(pingUrl, { method: 'GET' });
    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }
    const data = await res.json();
    return data;
  }

  static async fetchStudents(webAppUrl: string): Promise<Student[]> {
    if (!webAppUrl || !webAppUrl.startsWith('http')) {
      throw new Error('Invalid Google Apps Script URL');
    }
    const fetchUrl = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}action=read&t=${Date.now()}`;
    const res = await fetch(fetchUrl, { method: 'GET' });
    if (!res.ok) {
      throw new Error(`Failed to fetch from Google Sheets: Status ${res.status}`);
    }
    const json = await res.json();
    if (!json.success && json.error) {
      throw new Error(json.error);
    }
    const rawList: Student[] = json.data || [];
    return rawList.map(s => ({
      ...s,
      dob: formatDobOnly(s.dob),
      fatherDob: formatDobOnly(s.fatherDob),
      motherDob: formatDobOnly(s.motherDob)
    }));
  }

  static async createStudent(webAppUrl: string, student: Student): Promise<void> {
    if (!webAppUrl) return;
    const res = await this.sendRequest(webAppUrl, {
      action: 'create',
      student,
    });
    if (!res.success) {
      throw new Error(res.error || 'Failed to create student in Google Sheets');
    }
  }

  static async updateStudent(webAppUrl: string, student: Student): Promise<void> {
    if (!webAppUrl) return;
    const res = await this.sendRequest(webAppUrl, {
      action: 'update',
      student,
    });
    if (!res.success) {
      throw new Error(res.error || 'Failed to update student in Google Sheets');
    }
  }

  static async deleteStudent(webAppUrl: string, studentId: string): Promise<void> {
    if (!webAppUrl) return;
    const res = await this.sendRequest(webAppUrl, {
      action: 'delete',
      studentId,
    });
    if (!res.success) {
      throw new Error(res.error || 'Failed to delete student from Google Sheets');
    }
  }

  static async syncAllStudents(webAppUrl: string, students: Student[]): Promise<void> {
    if (!webAppUrl) return;
    const res = await this.sendRequest(webAppUrl, {
      action: 'syncAll',
      students,
    });
    if (!res.success) {
      throw new Error(res.error || 'Failed to bulk sync students to Google Sheets');
    }
  }
}
