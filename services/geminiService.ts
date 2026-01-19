import { GoogleGenAI, Chat, Part } from "@google/genai";
import { fileToGenerativePart } from "../utils/fileUtils";

// CRITICAL FIX: Assign process.env.API_KEY to a variable first.
// This prevents build tools from creating invalid syntax like { "KEY" } when using shorthand properties.
const apiKey = process.env.API_KEY;

const getGenAI = () => new GoogleGenAI({ apiKey: apiKey });

// Chat
export const createChat = (): Chat => {
    const ai = getGenAI();
    return ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            tools: [{googleSearch: {}}],
            systemInstruction: `Eres un "Crypto Sniper IA" experto. Tu prioridad es la precisión, la rapidez y la gestión de riesgo.

FORMATO OBLIGATORIO PARA SEÑALES:
Cada vez que sugieras una operación, DEBES incluir este bloque JSON EXACTO al final de tu respuesta.

\`\`\`json:signal
{
  "symbol": "BTC/USDT",
  "action": "COMPRAR (LONG)",
  "entryPrice": 64000.00,
  "targetPrice": 65500.00,
  "stopLoss": 63200.00,
  "leverage": "x20",
  "recommendedAmount": "10% Margin",
  "reason": "Ruptura de triangulo alcista con volumen"
}
\`\`\`

Si el usuario sube una imagen, analiza el gráfico técnico (velas, patrones, indicadores) y genera un JSON de tipo \`json:chart\` simulando la proyección futura.

Mantén el texto conversacional breve y directo ("Directo al grano"). Usa formato Markdown para resaltar precios y acciones.`,
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
