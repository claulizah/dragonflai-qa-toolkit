// Cliente compartido para llamar a la API de Claude.
// Todos los agentes importan este mismo archivo — un solo lugar para
// manejar la key, el modelo y errores.

require("dotenv").config();

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.CLAUDE_MODEL || "claude-sonnet-5";

if (!process.env.ANTHROPIC_API_KEY) {
  console.warn(
    "[aviso] No se encontró ANTHROPIC_API_KEY en .env. Copia .env.example a .env y agrega tu key."
  );
}

/**
 * Llama a Claude con un prompt de texto (y opcionalmente una imagen en base64).
 * @param {string} systemPrompt - instrucciones de sistema para el agente
 * @param {string} userPrompt - lo que el usuario pide
 * @param {object} [opts]
 * @param {string} [opts.imageBase64] - imagen en base64 (sin prefijo data:)
 * @param {string} [opts.imageMediaType] - ej. "image/png"
 * @param {number} [opts.maxTokens]
 * @returns {Promise<string>} el texto de respuesta de Claude
 */
async function askClaude(systemPrompt, userPrompt, opts = {}) {
  const { imageBase64, imageMediaType, maxTokens = 2000 } = opts;

  const content = [];
  if (imageBase64) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: imageMediaType || "image/png",
        data: imageBase64,
      },
    });
  }
  content.push({ type: "text", text: userPrompt });

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: "user", content }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Claude API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  return data.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n");
}

module.exports = { askClaude };
