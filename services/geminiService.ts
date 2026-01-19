
import { GoogleGenAI, Chat, Part } from "@google/genai";
import { fileToGenerativePart } from "../utils/fileUtils";

// FIX: Usar siempre process.env.API_KEY.
const getGenAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Chat
export const createChat = (): Chat => {
    const ai = getGenAI();
    return ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            tools: [{googleSearch: {}}],
            systemInstruction: `Eres un "Crypto Sniper IA" experto y conciso. 
TU OBJETIVO: Dar señales de trading claras, rápidas y rentables.

DIRECTIVAS:
1.  **Velocidad:** Responde rápido. Ve al grano.
2.  **Decisivo:** Usa imperativos: "COMPRA", "VENDE", "ESPERA".
3.  **Formato:** Cuando des una señal, SIEMPRE incluye el bloque JSON \`json:signal\`.

FORMATOS DE RESPUESTA:

**1. SEÑAL DE TRADING (JSON OBLIGATORIO):**
\`\`\`json:signal
{
  "symbol": "BTC/USDT",
  "action": "COMPRAR (LONG)",
  "entryPrice": 64200.00,
  "targetPrice": 65500.00,
  "stopLoss": 63500.00,
  "leverage": "x20",
  "recommendedAmount": "10% Margin",
  "reason": "Rebote en soporte clave EMA 200."
}
\`\`\`

**2. ANÁLISIS DE GRÁFICO:**
Si ves una imagen, genera \`json:chart\` con datos simulados proyectados.
\`\`\`json:chart
{
  "historicalData": [64000, 64100, 64050, 64200, 64150],
  "predictedData": [64300, 64450, 64600],
  "entryPoint": {"index": 4, "price": 64150},
  "stopLoss": 63800,
  "takeProfit": 64600,
  "timeLabels": ["10:00", "10:15", "10:30", "10:45", "11:00", "11:15", "11:30", "11:45"]
}
\`\`\`
`,
        },
    });
};

export const sendMessageStreamToChat = async (chat: Chat, message: string, image?: File) => {
    if (image) {
        const imagePart = await fileToGenerativePart(image);
        const contents: Part[] = [{text: message}, imagePart];
        return chat.sendMessageStream({ message: contents });
    }
    return chat.sendMessageStream({ message });
};
