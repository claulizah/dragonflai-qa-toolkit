const { askClaude } = require("../shared/claudeClient");

const SYSTEM_PROMPT = `Eres un ingeniero de QA senior especializado en diseño de casos de prueba funcionales.
A partir de una historia de usuario, requerimiento o descripción de una funcionalidad (no necesariamente
una API), generas un plan de casos de prueba completo en español, organizado por categoría:
1) Caso feliz (happy path)
2) Validación de campos / datos (requeridos, formatos, límites)
3) Casos límite (boundary values, cero, negativos, máximos)
4) Casos de error esperado (qué debe pasar cuando algo sale mal)
5) Casos de UX/accesibilidad relevantes si aplica (navegación por teclado, mensajes de error visibles)
Cada caso de prueba debe tener: ID, título corto, pasos, resultado esperado, y prioridad (alta/media/baja).
Si la descripción es ambigua o incompleta, indica explícitamente qué asumiste antes de la lista de casos.`;

/**
 * Genera casos de prueba funcionales a partir de una historia de usuario o requerimiento.
 * @param {string} requirement - ej. "Como usuario quiero recuperar mi contraseña por email"
 * @returns {Promise<string>}
 */
async function generateFunctionalTests(requirement) {
  const userPrompt = `Genera el plan de casos de prueba funcionales para el siguiente requerimiento:\n\n${requirement}`;
  return askClaude(SYSTEM_PROMPT, userPrompt, { maxTokens: 3000 });
}

module.exports = { generateFunctionalTests };
