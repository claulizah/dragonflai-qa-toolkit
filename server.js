require("dotenv").config();
const express = require("express");
const multer = require("multer");

const { generatePlaywrightTest } = require("./agents/playwrightGen");
const { generateApiTests } = require("./agents/apiTester");
const { runAccessibilityScan } = require("./agents/accessibility");
const { reviewScreenshot } = require("./agents/uxReview");
const { generateFunctionalTests } = require("./agents/testCaseGen");
const { generateBugReport } = require("./agents/bugReportGen");
const { addFinding, listFindings, removeFinding, clearFindings } = require("./agents/reportStore");
const { generateAuditReport } = require("./agents/reportGen");

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });

app.use(express.json({ limit: "2mb" }));
app.use(express.static("public"));

// ── Agente 1: Generador de Playwright ──
app.post("/api/playwright", async (req, res) => {
  try {
    const { description, url } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Describe el flujo a probar." });
    }
    const code = await generatePlaywrightTest(description.trim(), url?.trim());
    res.json({ code });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Agente 2: Casos de prueba de API ──
app.post("/api/api-test", async (req, res) => {
  try {
    const { spec, format } = req.body;
    if (!spec || !spec.trim()) {
      return res.status(400).json({ error: "Pega la especificación del endpoint o API." });
    }
    const result = await generateApiTests(spec.trim(), format);
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Agente 3: Accesibilidad (escaneo real con axe-core) ──
app.post("/api/accessibility", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url || !url.trim()) {
      return res.status(400).json({ error: "Indica la URL a revisar." });
    }
    const result = await runAccessibilityScan(url.trim());
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Agente 4: Revisión de UX/UI a partir de una captura ──
app.post("/api/ux-review", upload.single("screenshot"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "Sube una captura de pantalla." });
    }
    const imageBase64 = req.file.buffer.toString("base64");
    const feedback = await reviewScreenshot(imageBase64, req.file.mimetype, req.body.context);
    res.json({ feedback });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Agente 5: Casos de prueba funcionales (historia de usuario) ──
app.post("/api/test-cases", async (req, res) => {
  try {
    const { requirement } = req.body;
    if (!requirement || !requirement.trim()) {
      return res.status(400).json({ error: "Describe la historia de usuario o requerimiento." });
    }
    const result = await generateFunctionalTests(requirement.trim());
    res.json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Agente 6: Reporte de bugs ──
app.post("/api/bug-report", async (req, res) => {
  try {
    const { description } = req.body;
    if (!description || !description.trim()) {
      return res.status(400).json({ error: "Describe lo que observaste." });
    }
    const report = await generateBugReport(description.trim());
    res.json({ report });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// ── Hallazgos acumulados (alimentan el reporte final) ──
app.get("/api/findings", (req, res) => {
  res.json({ findings: listFindings() });
});

app.post("/api/findings", (req, res) => {
  const entry = addFinding(req.body);
  res.json({ entry });
});

app.delete("/api/findings/:id", (req, res) => {
  const findings = removeFinding(req.params.id);
  res.json({ findings });
});

app.delete("/api/findings", (req, res) => {
  clearFindings();
  res.json({ ok: true });
});

// ── Agente 7: Generador del reporte final (Word) ──
app.post("/api/report", async (req, res) => {
  try {
    const { cliente, producto, alcance, quickWins, nextSteps } = req.body;
    const findings = listFindings();
    const buffer = await generateAuditReport({ cliente, producto, alcance, quickWins, nextSteps, findings });
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    res.setHeader("Content-Disposition", `attachment; filename="QA_Audit_Report_${Date.now()}.docx"`);
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4141;
app.listen(PORT, () => {
  console.log(`\nDragonflAI QA Toolkit corriendo en http://localhost:${PORT}\n`);
});
