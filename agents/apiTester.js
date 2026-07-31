const { askClaude } = require("../shared/claudeClient");

const SYSTEM_PROMPT = `Eres un ingeniero de QA senior especializado en testing de APIs REST/SOAP.
A partir de una especificación de endpoint (puede venir como texto libre, un fragmento de OpenAPI/Swagger,
o una colección de Postman en JSON), generas un plan de casos de prueba en español y, cuando sea posible,
un script listo para correr con Postman/Newman en formato de colección JSON (v2.1) o, si el usuario lo pide,
un script de Playwright API testing (request fixture).
Siempre cubres: caso feliz (200/201), validación de esquema, campos requeridos faltantes, tipos de datos
incorrectos, valores límite, autenticación inválida/expirada, y códigos de error esperados (400/401/403/404/500).
Sé explícito sobre qué asumiste si la especificación es incompleta.`;

/**
 * Genera casos de prueba de API a partir de una especificación pegada por el usuario.
 * @param {string} spec - texto libre, OpenAPI o Postman collection
 * @param {string} [format] - "postman" | "playwright" | "texto"
 * @returns {Promise<string>}
 */
async function generateApiTests(spec, format = "texto") {
  const formatInstruction =
    format === "postman"
      ? "Entrega el resultado como una colección de Postman v2.1 en JSON, dentro de un bloque de código."
      : format === "playwright"
      ? "Entrega el resultado como un archivo de Playwright API testing (request fixture) en JavaScript."
      : "Entrega el resultado como una lista clara de casos de prueba en español, agrupados por categoría (feliz, validación, límites, errores, seguridad).";

  const userPrompt = `Especificación del endpoint o API:\n\n${spec}\n\n${formatInstruction}`;

  return askClaude(SYSTEM_PROMPT, userPrompt, { maxTokens: 3000 });
}

module.exports = { generateApiTests };
