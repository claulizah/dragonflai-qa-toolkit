const fs = require("fs");
const path = require("path");

const STORE_PATH = path.join(__dirname, "..", "findings.json");

function load() {
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
  } catch {
    return [];
  }
}

function save(findings) {
  fs.writeFileSync(STORE_PATH, JSON.stringify(findings, null, 2));
}

/**
 * Agrega un hallazgo al reporte en construcción.
 * @param {{severity:string, title:string, description:string, evidence?:string, recommendation?:string, source?:string}} finding
 */
function addFinding(finding) {
  const findings = load();
  const entry = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    severity: finding.severity || "Medio",
    title: finding.title || "(sin título)",
    description: finding.description || "",
    evidence: finding.evidence || "",
    recommendation: finding.recommendation || "",
    source: finding.source || "manual",
    createdAt: new Date().toISOString(),
  };
  findings.push(entry);
  save(findings);
  return entry;
}

function listFindings() {
  return load();
}

function removeFinding(id) {
  const findings = load().filter((f) => f.id !== id);
  save(findings);
  return findings;
}

function clearFindings() {
  save([]);
}

module.exports = { addFinding, listFindings, removeFinding, clearFindings };
