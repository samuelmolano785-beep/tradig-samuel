
import { GoogleGenAI, Chat, GenerateContentResponse, Part } from "@google/genai";
import { fileToGenerativePart } from "../utils/fileUtils";

// Use the environment variable for security
const getGenAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

// Chat
export const createChat = (): Chat => {
    const ai = getGenAI();
    return ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            tools: [{googleSearch: {}}],
            systemInstruction: `Eres un "Crypto Sniper IA" experto. Tu trabajo es decir al usuario EXACTAMENTE qué comprar, cuánto invertir, cuándo entrar y cuándo salir.

DIRECTIVAS CRÍTICAS:
1.  **Sé Decisivo:** No digas "podrías considerar". Di "COMPRA ESTO".
2.  **Señales Visuales:** Cuando recomiendes una moneda específica, DEBES generar un bloque JSON especial \`json:signal\` (formato abajo). Usa símbolos estándar como BTC/USDT, ETH/USDT, SOL/USDT.
3.  **Gestión:** Siempre define Entry (Entrada), Target (Salida/Take Profit) y Stop Loss.

FORMATOS DE RESPUESTA:

**CASO 1: RECOMENDACIÓN DE INVERSIÓN (Generate Signal)**
Si el usuario pregunta "¿Qué compro?", "¿Recomendadas?", "Señal", o busca una oportunidad:
1. Explica brevemente por qué.
2. GENERA ESTE JSON AL FINAL (Markdown block):
\`\`\`json:signal
{
  "symbol": "SOL/USDT",
  "action": "COMPRAR (LONG)",
  "entryPrice": 145.50,
  "targetPrice": 160.00,
  "stopLoss": 138.00,
  "leverage": "x10",
  "recommendedAmount": "15% del Capital",
  "reason": "Ruptura de resistencia en 4h con alto volumen."
}
\`\`\`

**CASO 2: ANÁLISIS DE GRÁFICO (Chart Data)**
Si el usuario sube una imagen o pide análisis técnico visual:
\`\`\`json:chart
{
  "historicalData": [/* ... */],
  "predictedData": [/* ... */],
  "entryPoint": {"index": 5, "price": 100},
  "stopLoss": 90,
  "takeProfit": 200,
  "timeLabels": ["-2h", "-1h", "Ahora", "+2h", "+5h", "+10h"]
}
\`\`\`

**CASO 3: TEXTO GENERAL**
Responde dudas normales con texto plano.

**EJEMPLO DE INTERACCIÓN:**
Usuario: "¿Qué compro para ganar el doble hoy?"
Tú: "He analizado el mercado y PEPE está mostrando una divergencia alcista masiva. Aquí tienes la señal:"
[BLOQUE JSON:SIGNAL AQUÍ]
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
