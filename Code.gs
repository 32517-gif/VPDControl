/**
 * Veridian Core - Backend System for Google Apps Script
 */

const SHEET_NAME_ENV = "EnvironmentLogs";
const SHEET_NAME_DEVICES = "DeviceLogs";

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Veridian Core | Precision')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * ดึงข้อมูลสรุปสำหรับ Dashboard
 */
function getDashboardData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const envSheet = ss.getSheetByName(SHEET_NAME_ENV) || ss.insertSheet(SHEET_NAME_ENV);
  const deviceSheet = ss.getSheetByName(SHEET_NAME_DEVICES) || ss.insertSheet(SHEET_NAME_DEVICES);
  
  const envData = envSheet.getDataRange().getValues();
  const deviceData = deviceSheet.getDataRange().getValues();

  let history = [];
  if (envData.length > 1) {
    history = envData.slice(-24).map(row => ({
      timestamp: row[0] instanceof Date ? Utilities.formatDate(row[0], Session.getScriptTimeZone(), "HH:mm") : String(row[0]),
      temp: Number(row[1]) || 0,
      hum: Number(row[2]) || 0,
      soil: Number(row[3]) || 0,
      vpd: Number(row[4]) || 0
    }));
  }

  let deviceStatus = { fog: 0, fan: 0, mode: 'Auto' };
  if (deviceData.length > 1) {
    const lastDevice = deviceData[deviceData.length - 1];
    deviceStatus = {
      fog: Number(lastDevice[1]) || 0,
      fan: Number(lastDevice[2]) || 0,
      mode: lastDevice[3] || 'Auto'
    };
  }

  let totalGdd = 0;
  if (envData.length > 1) {
    const temps = envData.slice(1).map(r => Number(r[1]));
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    totalGdd = Math.max(0, avgTemp - 10) * (temps.length / 144);
  }

  return {
    history: history,
    current: history.length > 0 ? history[history.length - 1] : { temp: 0, hum: 0, soil: 0, vpd: 0 },
    device: deviceStatus,
    totalGdd: Number(totalGdd.toFixed(1))
  };
}

/**
 * บันทึกคำสั่งควบคุมอุปกรณ์
 */
function executeActuators(fogIntensity, fanSpeed, mode) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const logSheet = ss.getSheetByName(SHEET_NAME_DEVICES) || ss.insertSheet(SHEET_NAME_DEVICES);
  logSheet.appendRow([new Date(), fogIntensity, fanSpeed, mode]);
  return { success: true, timestamp: new Date().toLocaleTimeString() };
}

/**
 * รับข้อมูลจาก ESP32 ผ่าน POST Request
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const envSheet = ss.getSheetByName(SHEET_NAME_ENV) || ss.insertSheet(SHEET_NAME_ENV);
    
    const temp = Number(data.temp);
    const hum = Number(data.hum);
    const soil = Number(data.soil);
    
    const es = 0.6108 * Math.exp((17.27 * temp) / (temp + 237.3));
    const ea = es * (hum / 100);
    const vpd = (es - ea).toFixed(2);
    
    envSheet.appendRow([new Date(), temp, hum, soil, vpd]);
    
    const deviceSheet = ss.getSheetByName(SHEET_NAME_DEVICES);
    const deviceData = deviceSheet.getDataRange().getValues();
    let command = { fog: 0, fan: 0, mode: 'Auto' };
    if (deviceData.length > 1) {
      const last = deviceData[deviceData.length - 1];
      command = { fog: last[1], fan: last[2], mode: last[3] };
    }
    
    return ContentService.createTextOutput(JSON.stringify({ 
      status: "success", 
      vpd: vpd,
      command: command 
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}