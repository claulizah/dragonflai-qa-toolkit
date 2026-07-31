const { chromium } = require("playwright");
const { AxeBuilder } = require("@axe-core/playwright");
const { askClaude } = require("../shared/claudeClient");

const SYSTEM_PROMPT = `Eres un especialista en accesibilidad web (WCAG 2.1 AA). Recibes una lista cruda
de violaciones detectadas por axe-core en formato JSON. Tu trabajo es traducirlas a un reporte claro
en español para un cliente no técnico: agrupa por severidad (crítico/serio/moderado/leve), explica el
impacto real para el usuario (no solo el código de la regla), y da una recomendación concreta de arreglo
para cada grupo. Sé breve pero específico. No inventes violaciones que no estén en los datos.`;

/**
 * Corre un escaneo real de accesibilidad con axe-core sobre una URL viva,
 * y usa Claude para resumir los hallazgos en lenguaje de negocio.
 * @param {string} url
 * @returns {Promise<{ raw: object[], summary: string }>}
 */
async function runAccessibilityScan(url) {
  const browser = await chromium.launch();
  let violations = [];
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "networkidle", timeout: 30000 });
    const results = await new AxeBuilder({ page }).analyze();
    violations = results.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodeCount: v.nodes.length,
      sampleTarget: v.nodes[0]?.target?.join(" ") || null,
    }));
  } finally {
    await browser.close();
  }

  if (violations.length === 0) {
    return {
      raw: [],
      summary: "axe-core no encontró violaciones automáticamente detectables en esta página. Recuerda que esto no reemplaza una revisión manual (navegación por teclado, lectores de pantalla, contraste real percibido).",
    };
  }

  const userPrompt = `Violaciones detectadas por axe-core en ${url}:\n\n${JSON.stringify(
    violations,
    null,
    2
  )}`;

  const summary = await askClaude(SYSTEM_PROMPT, userPrompt, { maxTokens: 2000 });
  return { raw: violations, summary };
}

module.exports = { runAccessibilityScan };
