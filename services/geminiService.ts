import { GoogleGenAI } from "@google/genai";
import { fileToGenerativePart } from "../utils/fileUtils";

const apiKey = "AIzaSyCZzOrruDL2uLNa3xnzJKPH5RLTEDo7_-U";

const genAI = new GoogleGenAI({ apiKey });

export const createChat = () => {
  return genAI.chats.create({
    model: "gemini-1.5-flash",
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: `
Eres un "Crypto Sniper IA" experto. Tu prioridad es la precisión, la rapidez y la gestión de riesgo.

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

Si el usuario sube una imagen, analiza el gráfico técnico y genera un JSON \`json:chart\`.

Mantén el texto breve y directo.
`
    }
  });
};

export const sendMessageStreamToChat = async (
  chat: any,
  message: string,
  image?: File
) => {
  if (image) {
    const imagePart = await fileToGenerativePart(image);
    return chat.sendMessageStream({
      message: [{ text: message }, imagePart]
    });
  }

  return chat.sendMessageStream({ message });
};