const { askClaude } = require("../shared/claudeClient");

const SYSTEM_PROMPT = `Eres un ingeniero de QA senior especializado en automatización con Playwright (JavaScript).
Generas scripts de Playwright completos, ejecutables, y bien comentados en español para los comentarios
y en código estándar para el código. Cubres siempre: caso feliz, campos vacíos, valores límite,
y al menos un caso de error esperado. Usa selectores robustos (role, label, testid) en vez de
selectores frágiles de CSS cuando sea posible. Devuelve SOLO el bloque de código, sin explicación
adicional antes o después, listo para pegar en un archivo .spec.js.`;

/**
 * Genera un script de Playwright a partir de una descripción de flujo.
 * @param {string} description - ej. "login con email inválido"
 * @param {string} [url] - URL de la app a probar, si se conoce
 * @returns {Promise<string>} código de Playwright
 */
async function generatePlaywrightTest(description, url) {
  const userPrompt = url
    ? `Genera un test de Playwright para: "${description}".\nLa URL de la aplicación es: ${url}`
    : `Genera un test de Playwright para: "${description}".\nNo se especificó URL, usa una constante BASE_URL al inicio del archivo para que el usuario la configure.`;

  return askClaude(SYSTEM_PROMPT, userPrompt, { maxTokens: 2500 });
}

module.exports = { generatePlaywrightTest };
