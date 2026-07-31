const { askClaude } = require("../shared/claudeClient");

const SYSTEM_PROMPT = `Eres un revisor senior de UX/UI para productos digitales. Recibes una captura de pantalla
y das retroalimentación específica y accionable en español, organizada en:
1) Jerarquía visual y legibilidad
2) Consistencia (espaciado, tipografía, color)
3) Usabilidad (affordances, estados de error/vacío, llamadas a la acción)
4) Accesibilidad visual (contraste aparente, tamaño de texto/targets táctiles)
No repitas obviedades genéricas — enfócate en lo que realmente ves en la imagen. Si algo se ve bien,
dilo también; no todo tiene que ser un problema.`;

/**
 * Analiza una captura de pantalla y devuelve retroalimentación de UX/UI.
 * @param {string} imageBase64 - imagen sin el prefijo data:
 * @param {string} imageMediaType - ej. "image/png"
 * @param {string} [context] - contexto adicional del usuario, ej. "pantalla de checkout"
 * @returns {Promise<string>}
 */
async function reviewScreenshot(imageBase64, imageMediaType, context) {
  const userPrompt = context
    ? `Contexto de la pantalla: ${context}\n\nRevisa esta captura de pantalla.`
    : "Revisa esta captura de pantalla.";

  return askClaude(SYSTEM_PROMPT, userPrompt, {
    imageBase64,
    imageMediaType,
    maxTokens: 1500,
  });
}

module.exports = { reviewScreenshot };
