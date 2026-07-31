const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, ShadingType, AlignmentType, BorderStyle, VerticalAlign, Header, Footer,
  PageNumber,
} = require("docx");

const NAVY = "1B2A4A";
const TEAL = "2E7D7B";
const GREY = "6B7280";
const CRITICAL = "C0392B";
const HIGH = "E67E22";
const MEDIUM = "D4AC0D";
const LOW = "7F8C8D";
const FONT = "Calibri";

function sevColor(sev) {
  if (sev === "Crítico") return CRITICAL;
  if (sev === "Alto") return HIGH;
  if (sev === "Medio") return MEDIUM;
  return LOW;
}

function h(text, size = 24, color = NAVY, bold = true) {
  return new TextRun({ text, size, color, bold, font: FONT });
}
function labelValue(label, value) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, color: NAVY, font: FONT, size: 20 }),
      new TextRun({ text: value || "—", color: "333333", font: FONT, size: 20 }),
    ],
  });
}
function sectionTitle(text) {
  return new Paragraph({
    spacing: { before: 300, after: 150 },
    border: { bottom: { color: TEAL, space: 4, style: BorderStyle.SINGLE, size: 8 } },
    children: [new TextRun({ text, bold: true, color: NAVY, font: FONT, size: 26 })],
  });
}
function bodyText(text) {
  return new Paragraph({
    spacing: { after: 120 },
    children: [new TextRun({ text: text || "", color: "333333", font: FONT, size: 21 })],
  });
}
function bullet(text) {
  return new Paragraph({
    spacing: { after: 80 },
    bullet: { level: 0 },
    children: [new TextRun({ text, color: "333333", font: FONT, size: 21 })],
  });
}
function quickWin(text) {
  return new Paragraph({
    spacing: { after: 100 },
    children: [
      new TextRun({ text: "✓  ", bold: true, color: TEAL, font: FONT, size: 21 }),
      new TextRun({ text, color: "333333", font: FONT, size: 21 }),
    ],
  });
}
function cell(text, opts = {}) {
  const { width, shading, bold = false, color = "333333", align = AlignmentType.LEFT, size = 18 } = opts;
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: shading ? { type: ShadingType.CLEAR, fill: shading } : undefined,
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
    children: [new Paragraph({ alignment: align, children: [new TextRun({ text: text || "", bold, color, font: FONT, size })] })],
  });
}

const COLS = [900, 1100, 3600, 2260, 1500];
const SEV_ORDER = { "Crítico": 0, "Alto": 1, "Medio": 2, "Bajo": 3 };

function findingRow(id, sev, desc, evidence, rec, isHeader = false) {
  if (isHeader) {
    return new TableRow({
      tableHeader: true,
      children: [
        cell(id, { width: COLS[0], shading: NAVY, bold: true, color: "FFFFFF", align: AlignmentType.CENTER }),
        cell(sev, { width: COLS[1], shading: NAVY, bold: true, color: "FFFFFF", align: AlignmentType.CENTER }),
        cell(desc, { width: COLS[2], shading: NAVY, bold: true, color: "FFFFFF" }),
        cell(evidence, { width: COLS[3], shading: NAVY, bold: true, color: "FFFFFF" }),
        cell(rec, { width: COLS[4], shading: NAVY, bold: true, color: "FFFFFF" }),
      ],
    });
  }
  return new TableRow({
    children: [
      cell(id, { width: COLS[0], align: AlignmentType.CENTER }),
      cell(sev, { width: COLS[1], shading: sevColor(sev), color: "FFFFFF", bold: true, align: AlignmentType.CENTER }),
      cell(desc, { width: COLS[2] }),
      cell(evidence, { width: COLS[3] }),
      cell(rec, { width: COLS[4] }),
    ],
  });
}

/**
 * Genera el reporte de QA Audit Express en Word, a partir de los hallazgos acumulados.
 * @param {object} opts
 * @param {string} opts.cliente
 * @param {string} opts.producto
 * @param {string} opts.alcance
 * @param {Array} opts.findings - lista de hallazgos {severity, title, description, evidence, recommendation}
 * @param {string} [opts.quickWins] - texto libre, una acción por línea
 * @param {string} [opts.nextSteps] - párrafo de recomendación de siguiente paso
 * @returns {Promise<Buffer>}
 */
async function generateAuditReport({ cliente, producto, alcance, findings = [], quickWins, nextSteps }) {
  const sorted = [...findings].sort((a, b) => (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9));
  const critCount = findings.filter((f) => f.severity === "Crítico").length;
  const highCount = findings.filter((f) => f.severity === "Alto").length;

  const rows = [findingRow("ID", "Severidad", "Hallazgo", "Evidencia", "Recomendación", true)];
  sorted.forEach((f, i) => {
    rows.push(findingRow(`F-${String(i + 1).padStart(2, "0")}`, f.severity, f.description || f.title, f.evidence, f.recommendation));
  });

  const summaryBullets = sorted.slice(0, 5).map((f) => bullet(`[${f.severity}] ${f.title}`));
  const quickWinLines = (quickWins || "").split("\n").map((l) => l.trim()).filter(Boolean);

  const doc = new Document({
    styles: { default: { document: { run: { font: FONT, size: 21, color: "333333" } } } },
    sections: [{
      properties: {
        page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            border: { bottom: { color: TEAL, space: 6, style: BorderStyle.SINGLE, size: 6 } },
            children: [
              new TextRun({ text: "DragonflAI QA", bold: true, color: NAVY, size: 20, font: FONT }),
              new TextRun({ text: "   |   dragonflaiqa.com", color: GREY, size: 18, font: FONT }),
            ],
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "DragonflAI QA — QA Audit Express   |   Confidencial   |   Página ", size: 16, color: GREY, font: FONT }),
              new TextRun({ children: [PageNumber.CURRENT], size: 16, color: GREY, font: FONT }),
              new TextRun({ text: " de ", size: 16, color: GREY, font: FONT }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: GREY, font: FONT }),
            ],
          })],
        }),
      },
      children: [
        new Paragraph({ spacing: { after: 60 }, children: [h("QA AUDIT EXPRESS", 44, NAVY)] }),
        new Paragraph({ spacing: { after: 300 }, children: [new TextRun({ text: "Reporte de Auditoría de Calidad", size: 24, color: TEAL, font: FONT, italics: true })] }),

        labelValue("Cliente", cliente),
        labelValue("Producto auditado", producto),
        labelValue("Fecha de entrega", new Date().toLocaleDateString("es-MX", { year: "numeric", month: "long", day: "numeric" })),
        labelValue("Alcance", alcance),
        labelValue("Realizado por", "Claudia Acosta — Senior QA Engineer & Release Manager"),

        sectionTitle("Resumen Ejecutivo"),
        bodyText(
          `Se identificaron ${findings.length} hallazgo(s), de los cuales ${critCount} crítico(s) y ${highCount} de severidad alta requieren atención antes del próximo lanzamiento.`
        ),
        ...(summaryBullets.length ? summaryBullets : [bodyText("No se registraron hallazgos en esta sesión.")]),

        sectionTitle("Metodología"),
        bodyText(
          "Testing funcional manual, validación de API, revisión visual y análisis de logs, apoyados en agentes propios con Claude AI (generador de casos, reporte de bugs, escaneo de accesibilidad con axe-core, revisión de UX/UI)."
        ),

        sectionTitle("Hallazgos Detallados"),
        new Table({ width: { size: 9360, type: WidthType.DXA }, columnWidths: COLS, rows }),

        sectionTitle("Quick Wins"),
        ...(quickWinLines.length ? quickWinLines.map(quickWin) : [bodyText("(agrega tus quick wins al generar el reporte)")]),

        sectionTitle("Recomendación de Siguiente Paso"),
        bodyText(nextSteps || "Se recomienda establecer un proceso de QA continuo. DragonflAI QA ofrece paquetes de retainer mensual para equipos que lanzan actualizaciones frecuentes."),

        new Paragraph({
          spacing: { before: 300 },
          border: { top: { color: TEAL, space: 6, style: BorderStyle.SINGLE, size: 6 } },
          children: [new TextRun({ text: "Claudia Acosta   |   dragonflaiqa.com   |   clauliz.acosta@gmail.com", bold: true, color: NAVY, size: 20, font: FONT })],
        }),
      ],
    }],
  });

  return Packer.toBuffer(doc);
}

module.exports = { generateAuditReport };
