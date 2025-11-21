import { GoogleGenAI, Type, Schema } from "@google/genai";
import { EcoEvent, DailyTip } from "../types";

// Initialize the client with the API Key from environment variables
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const eventsSchema: Schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      date: { type: Type.STRING, description: "Date in YYYY-MM-DD format" },
      title: { type: Type.STRING, description: "Official name of the report or holiday (e.g., 'Сдача 2-ТП (воздух)')" },
      description: { type: Type.STRING, description: "Brief details: who submits, which form to use, or holiday info." },
      category: { type: Type.STRING, enum: ["reporting", "holiday", "other"], description: "Type of event" },
    },
    required: ["date", "title", "description", "category"],
  },
};

const tipSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    date: { type: Type.STRING },
    tip: { type: Type.STRING, description: "Expert advice for an ecologist regarding legislation or best practices." },
    actionItem: { type: Type.STRING, description: "Specific action item for compliance or professional development." },
  },
  required: ["date", "tip", "actionItem"],
};

/**
 * Fetches a list of major ecological events and reporting deadlines for a specific month in 2026.
 */
export const fetchMonthlyEcoEvents = async (year: number, month: number): Promise<EcoEvent[]> => {
  try {
    const monthName = new Date(year, month).toLocaleString('ru-RU', { month: 'long' });

    const prompt = `
      Ты — главный эксперт по экологической безопасности и отчетности в РФ.
      Составь календарь событий на ${monthName} ${year} года.
      
      Акцент на **Календарь Эколога 2026** (Росприроднадзор, Росстат, Водные ресурсы).
      
      Категории:
      1. **reporting**: Строгие дедлайны сдачи отчетности.
         - Включи формы: 2-ТП (воздух, отходы, водхоз, рекультивация, радиоактивность), 4-ОС.
         - Платежи и декларации: Декларация о плате за НВОС, Отчет о ПЭК, Экологический сбор, Кадастр отходов (федеральный/региональный).
         - Используй законодательно утвержденные сроки для 2026 года (с учетом переноса выходных, если дедлайн выпадает на выходной).
         - Указывай название формы точно (например, "2-ТП (воздух)").
      
      2. **holiday**: Профессиональные и международные экологические праздники.
         - День заповедников, День водно-болотных угодий, День воды, Час Земли, День Эколога (5 июня) и др.
      
      Ответ должен быть кратким, профессиональным, на русском языке.
      Верни строго JSON массив.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: eventsSchema,
        temperature: 0.2, // Low temperature for factual accuracy
      },
    });

    const jsonText = response.text;
    if (!jsonText) return [];

    const events = JSON.parse(jsonText) as EcoEvent[];
    return events;

  } catch (error) {
    console.error("Error fetching eco events:", error);
    return [];
  }
};

/**
 * Generates a specific expert eco-tip for a selected date.
 */
export const generateDailyEcoTip = async (date: string): Promise<DailyTip | null> => {
  try {
    const prompt = `
      Дата: ${date}.
      Сгенерируй "Совет эксперта" для профессионального эколога на предприятии (РФ).
      
      Контент (одно из):
      1. Если сегодня или скоро дедлайн отчетности: напомни проверить актуальность ЭЦП, формы в Личном кабинете природопользователя (ЛКП).
      2. Нормативка: напомни о важном пункте ФЗ-7 "Об охране окружающей среды" или ФЗ-89 "Об отходах", актуальном для текущего сезона.
      3. Практика: совет по ведению журналов учета (ПОД-1, 2, 3), инвентаризации источников выбросов или паспортизации отходов.
      4. Если праздник: краткий профессиональный факт.
      
      Стиль: Деловой, полезный, лаконичный.
      Верни строго JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: tipSchema,
      },
    });

     const jsonText = response.text;
    if (!jsonText) return null;

    return JSON.parse(jsonText) as DailyTip;
  } catch (error) {
    console.error("Error generating daily tip:", error);
    return null;
  }
};