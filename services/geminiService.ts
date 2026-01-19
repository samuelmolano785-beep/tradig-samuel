
import { GoogleGenAI, Chat, Part } from "@google/genai";
import { fileToGenerativePart } from "../utils/fileUtils";

// FIX: Usar siempre process.env.API_KEY.
const getGenAI = () => new GoogleGenAI({ "AIzaSyCZzOrruDL2uLNa3xnzJKPH5RLTEDo7_-U" });

// Chat
export const createChat = (): Chat => {
    const ai = getGenAI();
    return ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
            tools: [{googleSearch: {}}],
            systemInstruction: `Eres un "Crypto Sniper IA" experto. Tu prioridad es la precisión y la rapidez.

FORMATO OBLIGATORIO PARA SEÑALES:
Cada vez que sugieras una operación, DEBES incluir este bloque JSON EXACTO al final de tu respuesta. No lo olvides.

\`\`\`json:signal
{
  "symbol": "BTC/USDT",
  "action": "COMPRAR (LONG)",
  "entryPrice": 64000.00,
  "targetPrice": 65500.00,
  "stopLoss": 63200.00,
  "leverage": "x20",
  "recommendedAmount": "10% Margin",
  "reason": "Ruptura de triangulo alcista"
}
\`\`\`

Si el usuario sube una imagen, analiza el gráfico y genera un JSON de tipo \`json:chart\` simulando la proyección futura.

Mantén el texto conversacional breve y directo. Usa formato Markdown para negritas en datos clave.`,
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
