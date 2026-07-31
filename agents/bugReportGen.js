const { askClaude } = require("../shared/claudeClient");

const SYSTEM_PROMPT = `Eres un ingeniero de QA senior redactando un reporte de bug profesional, en español,
con EXACTAMENTE esta estructura (usa estos encabezados literales, en este orden):

TÍTULO: (una línea corta y descriptiva del problema, orientada al impacto para el usuario)
SEVERIDAD: (Crítico / Alto / Medio / Bajo — justifica en una frase por qué)
SÍNTOMA REPORTADO: (qué observó el usuario o el tester, en 2-4 líneas, sin jerga técnica)
DIAGNÓSTICO: (lista de 2-4 puntos de cómo se investigó / qué se descartó, en el estilo de una
  investigación real: reproducción controlada, revisión de logs/DevTools, qué se confirmó o descartó)
CAUSA RAÍZ: (explicación técnica concreta de por qué ocurre, 2-3 líneas)
FIX SUGERIDO: (qué cambio de código o configuración resolvería el problema — si el usuario no da
  el código exacto, describe el enfoque de la corrección con precisión técnica)
VERIFICACIÓN: (qué se debe probar para confirmar que el fix funciona y no rompe nada más)

Si la información que recibes es incompleta (por ejemplo no hay causa raíz clara), sé honesto:
escribe "No determinado con la información disponible — se recomienda [siguiente paso concreto]"
en vez de inventar una causa. No inventes stack traces ni código que no se te haya proporcionado.`;

/**
 * Genera un reporte de bug estructurado a partir de una descripción libre del problema.
 * @param {string} description - lo que el usuario/tester observó, y cualquier detalle técnico disponible
 * @returns {Promise<string>}
 */
async function generateBugReport(description) {
  const userPrompt = `Redacta el reporte de bug para lo siguiente:\n\n${description}`;
  return askClaude(SYSTEM_PROMPT, userPrompt, { maxTokens: 1800 });
}

module.exports = { generateBugReport };
