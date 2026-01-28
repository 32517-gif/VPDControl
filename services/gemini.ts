
import { GoogleGenAI } from "@google/genai";
import { EnvironmentLog } from "../types";

export const getBotanicalAdvice = async (currentData: EnvironmentLog): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    คุณคือผู้เชี่ยวชาญด้านพฤกษศาสตร์และวิศวกรระบบโรงเรือน Emerald Precision
    ข้อมูลเซนเซอร์ปัจจุบัน:
    - อุณหภูมิ: ${currentData.temp}°C
    - ความชื้นสัมพัทธ์: ${currentData.hum}%
    - ค่า VPD: ${currentData.vpd} kPa

    จากข้อมูลนี้ กรุณาให้คำแนะนำสั้นๆ (ไม่เกิน 3 ข้อ) เป็นภาษาไทย
    เน้นไปที่การควบคุม "ระบบพ่นหมอก (Fogging)" และ "พัดลมระบายอากาศ (Fans)" เพื่อรักษาค่า VPD ให้เหมาะสม (เป้าหมายคือ 0.8 - 1.2 kPa)
    - หาก VPD สูงเกินไป: แนะนำให้เพิ่มหมอกหรือลดอุณหภูมิ
    - หาก VPD ต่ำเกินไป: แนะนำให้เปิดพัดลมเพื่อลดความชื้น
    ใช้โทนเสียงที่สุภาพและเป็นมืออาชีพ
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.7,
        topP: 0.9,
      }
    });

    return response.text || "ขออภัย ไม่สามารถดึงคำแนะนำได้ในขณะนี้";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูลโดย AI";
  }
};
