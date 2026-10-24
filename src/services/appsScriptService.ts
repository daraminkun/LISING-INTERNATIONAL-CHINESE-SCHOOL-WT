import { Student, StudentDocuments } from '../types';
import { formatDobOnly } from '../utils/ageUtils';
import { SchoolMajorEntry } from '../constants/studentOptions';
import { CustomTranslationsStore } from './schoolMajorService';
import { UserAccount } from './authService';
import {
  packStudentForSheets,
  unpackStudentFromSheets,
  splitStudentDocsIntoChunks,
  reassembleChunksToStudentDocs,
  getStableStudentCloudKey,
  StudentDocChunkRow,
} from '../utils/cloudDocSyncUtils';
import { getEffectiveStudentDocuments } from '../utils/documentUtils';
import { dbStorage } from './dbStorage';

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * Google Apps Script Backend for Student Management System (v3.0)
 * ប្រព័ន្ធគ្រប់គ្រងសិស្ស, ឯកសារភ្ជាប់, សាលារៀន/ជំនាញ & គណនីអ្នកប្រើប្រាស់ - Google Sheets Cloud Backend
 *
 * Instructions:
 * 1. Open your Google Sheet
 * 2. Click Extensions > Apps Script
 * 3. Replace all code in Code.gs with this script
 * 4. Click "Deploy" > "Manage deployments" (or "New deployment")
 * 5. Create new version or edit: "Student, Docs, School & Auth API v3.0"
 * 6. Execute as: "Me"
 * 7. Who has access: "Anyone"
 * 8. Click Deploy, authorize access, and copy the Web App URL!
 */

const SHEET_NAME = "Students";
const DOCS_SHEET_NAME = "StudentDocs";
const SCHOOLS_SHEET_NAME = "SchoolsMajors";
const USERS_SHEET_NAME = "Users";

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
  "Notes",
  "Documents"
];

const DOC_HEADERS = [
  "DocKey",
  "StudentKey",
  "StudentId",
  "Category",
  "PageIndex",
  "ChunkIndex",
  "TotalChunks",
  "MetaJSON",
  "DataChunk"
];

const SCHOOL_HEADERS = [
  "School",
  "Majors",
  "AgeRequirementKm",
  "AgeRequirementEn",
  "ShortAgeKm",
  "ShortAgeEn",
  "TranslationsKm",
  "TranslationsEn",
  "Location",
  "LogoUrl"
];

const USER_HEADERS = [
  "Id",
  "AdminName",
  "Username",
  "Password",
  "Role",
  "CreatedAt"
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

function getOrCreateDocsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(DOCS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(DOCS_SHEET_NAME);
    sheet.appendRow(DOC_HEADERS);
    sheet.getRange(1, 1, 1, DOC_HEADERS.length).setFontWeight("bold").setBackground("#ECFDF5");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getOrCreateSchoolsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SCHOOLS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SCHOOLS_SHEET_NAME);
    sheet.appendRow(SCHOOL_HEADERS);
    sheet.getRange(1, 1, 1, SCHOOL_HEADERS.length).setFontWeight("bold").setBackground("#E0F2FE");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function getOrCreateUsersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(USERS_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(USERS_SHEET_NAME);
    sheet.appendRow(USER_HEADERS);
    sheet.getRange(1, 1, 1, USER_HEADERS.length).setFontWeight("bold").setBackground("#FEF3C7");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function safeCellText(val, maxLen) {
  const str = String(val || "");
  return str.length <= (maxLen || 48500) ? str : str.substring(0, maxLen || 48500);
}

function studentToRow(s) {
  const rawDocsStr = s.documents ? JSON.stringify(s.documents) : "";
  const safeDocsStr = rawDocsStr.length <= 48000 ? rawDocsStr : "";
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
    safeCellText(s.notes, 48500),
    safeDocsStr
  ];
}

// Handle GET requests (Fetch students, full doc chunks, schools, users, or Ping)
function doGet(e) {
  try {
    const action = (e && e.parameter && e.parameter.action) || "read";

    if (action === "ping") {
      return responseJSON({
        success: true,
        apiVersion: "3.0",
        message: "Google Apps Script v3.0 is online and connected!",
        timestamp: new Date().toISOString()
      });
    }

    if (action === "getStudentDocs") {
      const targetKey = String((e.parameter && e.parameter.studentKey) || "").trim();
      const targetId = String((e.parameter && e.parameter.studentId) || "").trim();
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const docsSheet = ss.getSheetByName(DOCS_SHEET_NAME);
      const chunks = [];

      if (docsSheet && docsSheet.getLastRow() > 1) {
        const dRows = docsSheet.getDataRange().getValues();
        for (let r = 1; r < dRows.length; r++) {
          const row = dRows[r];
          const rowStudentKey = String(row[1] || "").trim();
          const rowStudentId = String(row[2] || "").trim();
          if ((targetKey && rowStudentKey === targetKey) || (!targetKey && targetId && rowStudentId === targetId)) {
            chunks.push({
              docKey: String(row[0] || ""),
              studentKey: rowStudentKey,
              studentId: rowStudentId,
              category: String(row[3] || ""),
              pageIndex: Number(row[4] || 0),
              chunkIndex: Number(row[5] || 0),
              totalChunks: Number(row[6] || 1),
              metaJson: String(row[7] || ""),
              dataChunk: String(row[8] || "")
            });
          }
        }
      }

      return responseJSON({
        success: true,
        apiVersion: "3.0",
        chunks: chunks
      });
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = getOrCreateSheet();

    // Read all student rows
    const data = sheet.getDataRange().getValues();
    const students = [];

    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      if (!row[0]) continue;

      let docs = undefined;
      if (row.length >= 25 && row[24]) {
        try {
          const rawDocs = String(row[24]).trim();
          if (rawDocs.startsWith("{")) {
            docs = JSON.parse(rawDocs);
          }
        } catch (docErr) {}
      }

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
          name: String(row[1] || row[2] || ""),
          documents: docs
        });
      } else if (row.length >= 18) {
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

    // Read Schools & Majors if SchoolsMajors sheet exists
    const schools = [];
    const customTranslations = { schools: {}, majors: {} };
    const schoolsSheet = ss.getSheetByName(SCHOOLS_SHEET_NAME);
    if (schoolsSheet && schoolsSheet.getLastRow() > 1) {
      const sData = schoolsSheet.getDataRange().getValues();
      for (let j = 1; j < sData.length; j++) {
        const sRow = sData[j];
        const schoolName = String(sRow[0] || "").trim();
        if (!schoolName) continue;
        const majorsRaw = String(sRow[1] || "");
        const majors = majorsRaw.split(/[,،、\\n]+/).map(m => m.trim()).filter(Boolean);
        schools.push({
          school: schoolName,
          majors: majors,
          ageRequirementKm: String(sRow[2] || ""),
          ageRequirementEn: String(sRow[3] || ""),
          shortAgeKm: String(sRow[4] || ""),
          shortAgeEn: String(sRow[5] || ""),
        });
        const logo = String(sRow[9] || "").trim();
        if (logo) {
          schools[schools.length - 1].logoUrl = logo;
        }
        if (sRow[6] || sRow[7] || sRow[8] || logo) {
          customTranslations.schools[schoolName] = {
            km: String(sRow[6] || schoolName),
            en: String(sRow[7] || schoolName),
            locationKm: String(sRow[8] || "តៃវ៉ាន់"),
            locationEn: String(sRow[8] || "Taiwan"),
            logoUrl: logo || undefined
          };
        }
      }
    }

    // Read Users if Users sheet exists
    const users = [];
    const usersSheet = ss.getSheetByName(USERS_SHEET_NAME);
    if (usersSheet && usersSheet.getLastRow() > 1) {
      const uData = usersSheet.getDataRange().getValues();
      for (let k = 1; k < uData.length; k++) {
        const uRow = uData[k];
        const uId = String(uRow[0] || "").trim();
        const uUser = String(uRow[2] || "").trim();
        if (!uUser) continue;
        users.push({
          id: uId || ("user-" + k),
          adminName: String(uRow[1] || uUser),
          username: uUser,
          password: String(uRow[3] || ""),
          role: String(uRow[4] || "User"),
          createdAt: String(uRow[5] || new Date().toISOString())
        });
      }
    }

    return responseJSON({
      success: true,
      apiVersion: "3.0",
      data: students,
      schools: schools.length > 0 ? schools : null,
      customTranslations: Object.keys(customTranslations.schools).length > 0 ? customTranslations : null,
      users: users.length > 0 ? users : null
    });

  } catch (error) {
    return responseJSON({
      success: false,
      error: error.toString()
    });
  }
}

// Handle POST requests (Create, Update, Delete, SaveStudentDocs, SyncAll, SyncSchools, SyncUsers)
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

      // Ensure header row has 25 columns
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

      // Auto-resolve order number collision if two students submit concurrently
      let maxId = 0;
      let collision = false;
      for (let i = 1; i < data.length; i++) {
        const existingId = String(data[i][0] || "").trim();
        const num = parseInt(existingId.replace(/\\D/g, "") || "0", 10);
        if (num > maxId) maxId = num;
        if (existingId === String(s.studentId).trim()) {
          collision = true;
        }
      }
      if (collision) {
        s.studentId = String(maxId + 1);
      }

      sheet.appendRow(studentToRow(s));

      return responseJSON({
        success: true,
        apiVersion: "3.0",
        message: "Student created successfully",
        studentId: s.studentId,
        student: s
      });
    }

    if (action === "update") {
      const s = payload.student;
      if (!s || !s.studentId) {
        throw new Error("Missing student information");
      }

      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

      let targetRowIdx = -1;
      // Match by CreatedAt first if available, then fallback to studentId
      if (s.createdAt) {
        for (let i = 1; i < data.length; i++) {
          if (data[i].length >= 23 && String(data[i][22] || "").trim() === String(s.createdAt).trim()) {
            targetRowIdx = i + 1;
            break;
          }
        }
      }
      if (targetRowIdx === -1) {
        for (let i = 1; i < data.length; i++) {
          if (String(data[i][0]).trim() === String(s.studentId).trim()) {
            targetRowIdx = i + 1;
            break;
          }
        }
      }

      if (targetRowIdx === -1) {
        sheet.appendRow(studentToRow(s));
      } else {
        const updatedRow = studentToRow(s);
        sheet.getRange(targetRowIdx, 1, 1, updatedRow.length).setValues([updatedRow]);
      }

      return responseJSON({
        success: true,
        apiVersion: "3.0",
        message: "Student updated successfully"
      });
    }

    if (action === "saveStudentDocs") {
      const studentKey = String(payload.studentKey || "").trim();
      const chunks = payload.chunks || [];
      if (!studentKey) throw new Error("Missing studentKey");

      const docsSheet = getOrCreateDocsSheet();
      const dData = docsSheet.getDataRange().getValues();
      const keptRows = [];
      for (let i = 1; i < dData.length; i++) {
        if (String(dData[i][1] || "").trim() !== studentKey) {
          keptRows.push(dData[i]);
        }
      }

      for (let c = 0; c < chunks.length; c++) {
        const ch = chunks[c];
        keptRows.push([
          String(ch.docKey || ""),
          studentKey,
          String(ch.studentId || ""),
          String(ch.category || ""),
          Number(ch.pageIndex || 0),
          Number(ch.chunkIndex || 0),
          Number(ch.totalChunks || 1),
          safeCellText(ch.metaJson, 10000),
          safeCellText(ch.dataChunk, 45000)
        ]);
      }

      if (docsSheet.getLastRow() > 1) {
        docsSheet.getRange(2, 1, docsSheet.getLastRow() - 1, docsSheet.getLastColumn()).clearContent();
      }
      docsSheet.getRange(1, 1, 1, DOC_HEADERS.length).setValues([DOC_HEADERS]);
      if (keptRows.length > 0) {
        docsSheet.getRange(2, 1, keptRows.length, DOC_HEADERS.length).setValues(keptRows);
      }

      return responseJSON({
        success: true,
        apiVersion: "3.0",
        message: "Saved " + chunks.length + " document chunks"
      });
    }

    if (action === "delete") {
      const studentId = payload.studentId;
      const studentKey = String(payload.studentKey || "").trim();
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

      // Also clean up StudentDocs chunks if present
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const docsSheet = ss.getSheetByName(DOCS_SHEET_NAME);
      if (docsSheet && docsSheet.getLastRow() > 1) {
        const dData = docsSheet.getDataRange().getValues();
        for (let r = dData.length - 1; r >= 1; r--) {
          const rKey = String(dData[r][1] || "").trim();
          const rId = String(dData[r][2] || "").trim();
          if ((studentKey && rKey === studentKey) || (!studentKey && rId === String(studentId).trim())) {
            docsSheet.deleteRow(r + 1);
          }
        }
      }

      if (!found) {
        throw new Error("Student order number not found: " + studentId);
      }

      return responseJSON({
        success: true,
        apiVersion: "3.0",
        message: "Student deleted successfully"
      });
    }

    if (action === "syncSchools") {
      const schools = payload.schools || [];
      const customTranslations = payload.customTranslations || { schools: {} };
      const schoolsSheet = getOrCreateSchoolsSheet();

      if (schoolsSheet.getLastRow() > 1) {
        schoolsSheet.getRange(2, 1, schoolsSheet.getLastRow() - 1, schoolsSheet.getLastColumn()).clearContent();
      }

      schoolsSheet.getRange(1, 1, 1, SCHOOL_HEADERS.length).setValues([SCHOOL_HEADERS]);

      if (schools.length > 0) {
        const sRows = schools.map(s => {
          const trans = (customTranslations.schools && customTranslations.schools[s.school]) || {};
          const majorsStr = Array.isArray(s.majors) ? s.majors.join(", ") : (s.majors || "");
          const rawLogo = s.logoUrl || trans.logoUrl || "";
          const safeLogo = String(rawLogo).length <= 49000 ? rawLogo : "";
          return [
            s.school || "",
            majorsStr,
            s.ageRequirementKm || "",
            s.ageRequirementEn || "",
            s.shortAgeKm || "",
            s.shortAgeEn || "",
            trans.km || "",
            trans.en || "",
            trans.locationKm || trans.location || "",
            safeLogo
          ];
        });
        schoolsSheet.getRange(2, 1, sRows.length, SCHOOL_HEADERS.length).setValues(sRows);
      }

      return responseJSON({
        success: true,
        apiVersion: "3.0",
        message: "Synced " + schools.length + " schools & majors successfully"
      });
    }

    if (action === "syncAll") {
      const students = payload.students || [];
      const schools = payload.schools;
      const customTranslations = payload.customTranslations || { schools: {} };

      if (sheet.getLastRow() > 1) {
        sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
      }

      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);

      if (students.length > 0) {
        const rows = students.map(s => studentToRow(s));
        sheet.getRange(2, 1, rows.length, HEADERS.length).setValues(rows);
      }

      if (Array.isArray(schools)) {
        const schoolsSheet = getOrCreateSchoolsSheet();
        if (schoolsSheet.getLastRow() > 1) {
          schoolsSheet.getRange(2, 1, schoolsSheet.getLastRow() - 1, schoolsSheet.getLastColumn()).clearContent();
        }
        schoolsSheet.getRange(1, 1, 1, SCHOOL_HEADERS.length).setValues([SCHOOL_HEADERS]);

        if (schools.length > 0) {
          const sRows = schools.map(s => {
            const trans = (customTranslations.schools && customTranslations.schools[s.school]) || {};
            const majorsStr = Array.isArray(s.majors) ? s.majors.join(", ") : (s.majors || "");
            const rawLogo = s.logoUrl || trans.logoUrl || "";
            const safeLogo = String(rawLogo).length <= 49000 ? rawLogo : "";
            return [
              s.school || "",
              majorsStr,
              s.ageRequirementKm || "",
              s.ageRequirementEn || "",
              s.shortAgeKm || "",
              s.shortAgeEn || "",
              trans.km || "",
              trans.en || "",
              trans.locationKm || trans.location || "",
              safeLogo
            ];
          });
          schoolsSheet.getRange(2, 1, sRows.length, SCHOOL_HEADERS.length).setValues(sRows);
        }
      }

      return responseJSON({
        success: true,
        apiVersion: "3.0",
        message: "Synced " + students.length + " students successfully"
      });
    }

    if (action === "syncUsers") {
      const users = payload.users || [];
      const usersSheet = getOrCreateUsersSheet();
      if (usersSheet.getLastRow() > 1) {
        usersSheet.getRange(2, 1, usersSheet.getLastRow() - 1, usersSheet.getLastColumn()).clearContent();
      }
      usersSheet.getRange(1, 1, 1, USER_HEADERS.length).setValues([USER_HEADERS]);
      if (users.length > 0) {
        const uRows = users.map(u => [
          u.id || "",
          u.adminName || "",
          u.username || "",
          u.password || "",
          u.role || "User",
          u.createdAt || ""
        ]);
        usersSheet.getRange(2, 1, uRows.length, USER_HEADERS.length).setValues(uRows);
      }
      return responseJSON({
        success: true,
        apiVersion: "3.0",
        message: "Synced " + users.length + " users successfully"
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

export interface RemoteDataResult {
  students: Student[];
  schools: SchoolMajorEntry[] | null;
  customTranslations?: CustomTranslationsStore | null;
  deletedSchools?: string[];
  deletedMajors?: string[];
  users?: UserAccount[] | null;
  apiVersion?: string;
}

export class AppsScriptService {
  private static serverApiVersionMap = new Map<string, string>();

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

  static getServerApiVersion(webAppUrl: string): string {
    return this.serverApiVersionMap.get(webAppUrl) || '2.0';
  }

  static async ping(webAppUrl: string): Promise<{ success: boolean; message?: string; apiVersion?: string }> {
    if (!webAppUrl || !webAppUrl.startsWith('http')) {
      throw new Error('Invalid URL');
    }
    const pingUrl = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}action=ping`;
    const res = await fetch(pingUrl, { method: 'GET' });
    if (!res.ok) {
      throw new Error(`Status ${res.status}`);
    }
    const data = await res.json();
    if (data?.apiVersion) {
      this.serverApiVersionMap.set(webAppUrl, String(data.apiVersion));
    }
    return data;
  }

  /**
   * Fetch students (automatically unpacking embedded cloud document envelopes), schools, and users
   */
  static async fetchAllData(webAppUrl: string): Promise<RemoteDataResult> {
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

    const detectedVersion = json.apiVersion ? String(json.apiVersion) : '2.0';
    this.serverApiVersionMap.set(webAppUrl, detectedVersion);

    const rawList: Student[] = json.data || [];
    const formattedStudents = rawList.map(raw => {
      const unpacked = unpackStudentFromSheets(raw);
      if (unpacked.documents && Object.keys(unpacked.documents).length > 0) {
        dbStorage.saveStudentDocumentsForStudent(unpacked, unpacked.documents, true).catch(() => {});
      }
      return {
        ...unpacked,
        dob: formatDobOnly(unpacked.dob),
        fatherDob: formatDobOnly(unpacked.fatherDob),
        motherDob: formatDobOnly(unpacked.motherDob),
      };
    });

    return {
      students: formattedStudents,
      schools: Array.isArray(json.schools) ? json.schools : null,
      customTranslations: json.customTranslations || null,
      deletedSchools: Array.isArray(json.deletedSchools) ? json.deletedSchools : [],
      deletedMajors: Array.isArray(json.deletedMajors) ? json.deletedMajors : [],
      users: Array.isArray(json.users) ? json.users : null,
      apiVersion: detectedVersion,
    };
  }

  static async fetchStudents(webAppUrl: string): Promise<Student[]> {
    const data = await this.fetchAllData(webAppUrl);
    return data.students;
  }

  /**
   * Uploads full-resolution / multi-MB PDF document chunks when backend runs Code.gs v3.0+
   */
  static async saveStudentFullDocs(webAppUrl: string, student: Student): Promise<void> {
    if (!webAppUrl || this.getServerApiVersion(webAppUrl) !== '3.0') return;
    const effectiveDocs = getEffectiveStudentDocuments(student) || student.documents;
    if (!effectiveDocs || Object.keys(effectiveDocs).length === 0) return;

    const chunks = splitStudentDocsIntoChunks({ ...student, documents: effectiveDocs });
    if (chunks.length === 0) return;

    const studentKey = getStableStudentCloudKey(student);
    await this.sendRequest(webAppUrl, {
      action: 'saveStudentDocs',
      studentKey,
      chunks,
    });
  }

  /**
   * Fetches full-resolution / multi-MB PDF document chunks on demand when backend runs Code.gs v3.0+
   */
  static async fetchStudentFullDocs(
    webAppUrl: string,
    student: Pick<Student, 'studentId' | 'createdAt' | 'nameKhmer' | 'phone'>
  ): Promise<StudentDocuments | null> {
    if (!webAppUrl || this.getServerApiVersion(webAppUrl) !== '3.0') return null;
    try {
      const studentKey = getStableStudentCloudKey(student);
      const query = `${webAppUrl}${webAppUrl.includes('?') ? '&' : '?'}action=getStudentDocs&studentKey=${encodeURIComponent(
        studentKey
      )}&studentId=${encodeURIComponent(student.studentId || '')}&t=${Date.now()}`;
      const res = await fetch(query, { method: 'GET' });
      if (!res.ok) return null;
      const json = await res.json();
      if (!json.success || !Array.isArray(json.chunks) || json.chunks.length === 0) {
        return null;
      }
      const docs = reassembleChunksToStudentDocs(json.chunks as StudentDocChunkRow[]);
      if (docs && Object.keys(docs).length > 0) {
        await dbStorage.saveStudentDocumentsForStudent(student, docs, false);
        return docs;
      }
      return null;
    } catch {
      return null;
    }
  }

  static async createStudent(webAppUrl: string, student: Student): Promise<Student> {
    if (!webAppUrl) return student;

    const hydrated: Student = {
      ...student,
      documents: getEffectiveStudentDocuments(student) || student.documents,
    };

    let packed = await packStudentForSheets(hydrated);
    let res = await this.sendRequest(webAppUrl, {
      action: 'create',
      student: packed,
    });

    // Automatic order-number collision recovery on legacy v2.0 Apps Script
    if (!res.success && String(res.error || '').toLowerCase().includes('already exists')) {
      const latest = await this.fetchAllData(webAppUrl);
      const maxNum = latest.students.reduce((max, item) => {
        const n = parseInt((item.studentId || '').replace(/\D/g, '') || '0', 10);
        return n > max ? n : max;
      }, 0);
      const nextId = String(maxNum + 1);
      const reassigned: Student = { ...hydrated, studentId: nextId };
      packed = await packStudentForSheets(reassigned);
      res = await this.sendRequest(webAppUrl, {
        action: 'create',
        student: packed,
      });
      if (res.success) {
        await dbStorage.saveStudentDocumentsForStudent(reassigned, reassigned.documents || {}, true);
        if (this.getServerApiVersion(webAppUrl) === '3.0') {
          this.saveStudentFullDocs(webAppUrl, reassigned).catch(() => {});
        }
        return reassigned;
      }
    }

    if (!res.success) {
      throw new Error(res.error || 'Failed to create student in Google Sheets');
    }

    const finalId = res.studentId ? String(res.studentId) : hydrated.studentId;
    const finalStudent: Student = { ...hydrated, studentId: finalId };

    if (res.apiVersion) {
      this.serverApiVersionMap.set(webAppUrl, String(res.apiVersion));
    }
    if (this.getServerApiVersion(webAppUrl) === '3.0') {
      this.saveStudentFullDocs(webAppUrl, finalStudent).catch(() => {});
    }

    return finalStudent;
  }

  static async updateStudent(webAppUrl: string, student: Student): Promise<void> {
    if (!webAppUrl) return;

    const hydrated: Student = {
      ...student,
      documents: getEffectiveStudentDocuments(student) || student.documents,
    };

    const packed = await packStudentForSheets(hydrated);
    let res = await this.sendRequest(webAppUrl, {
      action: 'update',
      student: packed,
    });

    if (!res.success && String(res.error || '').toLowerCase().includes('not found')) {
      res = await this.sendRequest(webAppUrl, {
        action: 'create',
        student: packed,
      });
    }

    if (!res.success) {
      throw new Error(res.error || 'Failed to update student in Google Sheets');
    }

    if (res.apiVersion) {
      this.serverApiVersionMap.set(webAppUrl, String(res.apiVersion));
    }
    if (this.getServerApiVersion(webAppUrl) === '3.0') {
      this.saveStudentFullDocs(webAppUrl, hydrated).catch(() => {});
    }
  }

  static async deleteStudent(webAppUrl: string, studentId: string, student?: Student): Promise<void> {
    if (!webAppUrl) return;
    const studentKey = student ? getStableStudentCloudKey(student) : undefined;
    const res = await this.sendRequest(webAppUrl, {
      action: 'delete',
      studentId,
      studentKey,
    });
    if (!res.success) {
      throw new Error(res.error || 'Failed to delete student from Google Sheets');
    }
  }

  private static sanitizeSchoolsForSheets(
    schools: SchoolMajorEntry[],
    customTranslations?: CustomTranslationsStore
  ): { safeSchools: SchoolMajorEntry[]; safeTranslations?: CustomTranslationsStore } {
    const safeSchools = schools.map(s => ({
      ...s,
      logoUrl: s.logoUrl && s.logoUrl.length <= 48000 ? s.logoUrl : undefined,
    }));

    let safeTranslations = customTranslations;
    if (customTranslations?.schools) {
      const cleanedSchools: CustomTranslationsStore['schools'] = {};
      for (const [k, v] of Object.entries(customTranslations.schools)) {
        cleanedSchools[k] = {
          ...v,
          logoUrl: v?.logoUrl && v.logoUrl.length <= 48000 ? v.logoUrl : undefined,
        };
      }
      safeTranslations = {
        ...customTranslations,
        schools: cleanedSchools,
      };
    }

    return { safeSchools, safeTranslations };
  }

  static async syncSchools(
    webAppUrl: string,
    schools: SchoolMajorEntry[],
    customTranslations?: CustomTranslationsStore,
    deletedSchools?: string[],
    deletedMajors?: string[]
  ): Promise<void> {
    if (!webAppUrl) return;
    const { safeSchools, safeTranslations } = this.sanitizeSchoolsForSheets(schools, customTranslations);
    const res = await this.sendRequest(webAppUrl, {
      action: 'syncSchools',
      schools: safeSchools,
      customTranslations: safeTranslations,
      deletedSchools,
      deletedMajors,
    });
    if (!res.success) {
      throw new Error(res.error || 'Failed to sync schools to Google Sheets');
    }
  }

  static async syncAllStudents(webAppUrl: string, students: Student[]): Promise<void> {
    if (!webAppUrl) return;
    const packedStudents = await Promise.all(
      students.map(s =>
        packStudentForSheets({
          ...s,
          documents: getEffectiveStudentDocuments(s) || s.documents,
        })
      )
    );
    const res = await this.sendRequest(webAppUrl, {
      action: 'syncAll',
      students: packedStudents,
    });
    if (!res.success) {
      throw new Error(res.error || 'Failed to bulk sync students to Google Sheets');
    }
  }

  static async syncUsers(webAppUrl: string, users: UserAccount[]): Promise<void> {
    if (!webAppUrl) return;
    const res = await this.sendRequest(webAppUrl, {
      action: 'syncUsers',
      users,
    });
    if (!res.success) {
      throw new Error(res.error || 'Failed to sync users to Google Sheets');
    }
  }

  static async syncAllData(
    webAppUrl: string,
    students: Student[],
    schools: SchoolMajorEntry[],
    customTranslations?: CustomTranslationsStore,
    deletedSchools?: string[],
    deletedMajors?: string[]
  ): Promise<void> {
    if (!webAppUrl) return;
    const { safeSchools, safeTranslations } = this.sanitizeSchoolsForSheets(schools, customTranslations);
    const packedStudents = await Promise.all(
      students.map(s =>
        packStudentForSheets({
          ...s,
          documents: getEffectiveStudentDocuments(s) || s.documents,
        })
      )
    );
    const res = await this.sendRequest(webAppUrl, {
      action: 'syncAll',
      students: packedStudents,
      schools: safeSchools,
      customTranslations: safeTranslations,
      deletedSchools,
      deletedMajors,
    });
    if (!res.success) {
      throw new Error(res.error || 'Failed to bulk sync all data to Google Sheets');
    }
  }
}
