function setLoading(outEl, msg) {
  outEl.innerHTML = `<div class="loading">${msg}</div>`;
}
function setError(outEl, msg) {
  outEl.innerHTML = `<div class="error">${msg}</div>`;
}

// ── Agente 1: Playwright ──
document.getElementById("form-playwright").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = document.getElementById("out-playwright");
  const btn = e.target.querySelector("button");
  const description = e.target.description.value;
  const url = e.target.url.value;
  btn.disabled = true;
  setLoading(out, "Generando script de Playwright...");
  try {
    const res = await fetch("/api/playwright", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description, url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error desconocido");
    out.innerHTML = `<pre>${escapeHtml(data.code)}</pre>`;
  } catch (err) {
    setError(out, err.message);
  } finally {
    btn.disabled = false;
  }
});

// ── Agente 2: API tests ──
document.getElementById("form-api").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = document.getElementById("out-api");
  const btn = e.target.querySelector("button");
  const spec = e.target.spec.value;
  const format = e.target.format.value;
  btn.disabled = true;
  setLoading(out, "Generando casos de prueba...");
  try {
    const res = await fetch("/api/api-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spec, format }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error desconocido");
    out.innerHTML = `<pre>${escapeHtml(data.result)}</pre>`;
  } catch (err) {
    setError(out, err.message);
  } finally {
    btn.disabled = false;
  }
});

// ── Agente 3: Accesibilidad ──
document.getElementById("form-a11y").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = document.getElementById("out-a11y");
  const btn = e.target.querySelector("button");
  const url = e.target.url.value;
  btn.disabled = true;
  setLoading(out, "Escaneando con axe-core (puede tardar unos segundos)...");
  try {
    const res = await fetch("/api/accessibility", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error desconocido");
    const meta = `<div class="meta">${data.raw.length} violaciones detectadas por axe-core</div>`;
    const addBtn = data.raw.length
      ? `<button class="add-finding-btn" id="addA11yFindings">+ Agregar ${data.raw.length} hallazgo(s) al reporte</button>`
      : "";
    out.innerHTML = `${meta}<div class="summary">${escapeHtml(data.summary)}</div>${addBtn}`;
    if (data.raw.length) {
      document.getElementById("addA11yFindings").addEventListener("click", async (ev) => {
        const b = ev.target;
        b.disabled = true;
        b.textContent = "Agregando...";
        const impactMap = { critical: "Crítico", serious: "Alto", moderate: "Medio", minor: "Bajo" };
        for (const v of data.raw) {
          await fetch("/api/findings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              severity: impactMap[v.impact] || "Medio",
              title: v.help,
              description: `${v.description} (elemento: ${v.sampleTarget || "n/d"}, ${v.nodeCount} ocurrencia(s))`,
              evidence: v.helpUrl,
              recommendation: "Ver guía en helpUrl para el fix específico de esta regla WCAG.",
              source: "accessibility",
            }),
          });
        }
        b.textContent = "✓ Agregados al reporte";
        loadFindings();
      });
    }
  } catch (err) {
    setError(out, err.message);
  } finally {
    btn.disabled = false;
  }
});

// ── Agente 4: UX/UI ──
document.getElementById("form-ux").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = document.getElementById("out-ux");
  const btn = e.target.querySelector("button");
  const formData = new FormData(e.target);
  btn.disabled = true;
  setLoading(out, "Analizando la captura...");
  try {
    const res = await fetch("/api/ux-review", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error desconocido");
    out.innerHTML = `<div class="summary">${escapeHtml(data.feedback)}</div>`;
  } catch (err) {
    setError(out, err.message);
  } finally {
    btn.disabled = false;
  }
});

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ── Agente 5: Casos de prueba funcionales ──
document.getElementById("form-testcases").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = document.getElementById("out-testcases");
  const btn = e.target.querySelector("button");
  const requirement = e.target.requirement.value;
  btn.disabled = true;
  setLoading(out, "Generando casos de prueba...");
  try {
    const res = await fetch("/api/test-cases", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requirement }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error desconocido");
    out.innerHTML = `<div class="summary">${escapeHtml(data.result)}</div>`;
  } catch (err) {
    setError(out, err.message);
  } finally {
    btn.disabled = false;
  }
});

// ── Agente 6: Reporte de bugs ──
document.getElementById("form-bugreport").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = document.getElementById("out-bugreport");
  const btn = e.target.querySelector("button");
  const description = e.target.description.value;
  const severity = e.target.severity.value;
  btn.disabled = true;
  setLoading(out, "Redactando reporte de bug...");
  try {
    const res = await fetch("/api/bug-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ description }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Error desconocido");
    const titleMatch = data.report.match(/TÍTULO:\s*(.+)/i);
    const title = titleMatch ? titleMatch[1].trim() : description.slice(0, 60);
    out.innerHTML = `
      <div class="summary">${escapeHtml(data.report)}</div>
      <button class="add-finding-btn" data-severity="${severity}" data-title="${escapeHtml(title)}" data-desc="${escapeHtml(data.report)}" data-source="bug-report">+ Agregar al reporte</button>
    `;
    out.querySelector(".add-finding-btn").addEventListener("click", addFindingFromButton);
  } catch (err) {
    setError(out, err.message);
  } finally {
    btn.disabled = false;
  }
});

async function addFindingFromButton(e) {
  const b = e.target;
  b.disabled = true;
  b.textContent = "Agregando...";
  try {
    await fetch("/api/findings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        severity: b.dataset.severity,
        title: b.dataset.title,
        description: b.dataset.desc,
        recommendation: b.dataset.rec || "",
        evidence: b.dataset.evidence || "",
        source: b.dataset.source,
      }),
    });
    b.textContent = "✓ Agregado al reporte";
    loadFindings();
  } catch {
    b.textContent = "Error al agregar";
    b.disabled = false;
  }
}

// ── Panel de hallazgos / reporte ──
async function loadFindings() {
  const list = document.getElementById("findings-list");
  try {
    const res = await fetch("/api/findings");
    const data = await res.json();
    if (!data.findings.length) {
      list.innerHTML = `<p class="empty-findings">Aún no hay hallazgos agregados. Usa "+ Agregar al reporte" en el agente de bugs o accesibilidad.</p>`;
      return;
    }
    list.innerHTML = data.findings.map(f => `
      <div class="finding-row">
        <span class="finding-sev sev-${f.severity}">${f.severity}</span>
        <span class="finding-title">${escapeHtml(f.title)}</span>
        <button class="finding-remove" data-id="${f.id}">✕</button>
      </div>
    `).join("");
    list.querySelectorAll(".finding-remove").forEach(btn => {
      btn.addEventListener("click", async () => {
        await fetch(`/api/findings/${btn.dataset.id}`, { method: "DELETE" });
        loadFindings();
      });
    });
  } catch {
    list.innerHTML = `<p class="empty-findings">No se pudo cargar la lista de hallazgos.</p>`;
  }
}
loadFindings();

// ── Generar el reporte Word final ──
document.getElementById("form-report").addEventListener("submit", async (e) => {
  e.preventDefault();
  const out = document.getElementById("out-report");
  const btn = e.target.querySelector("button");
  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());
  btn.disabled = true;
  setLoading(out, "Generando el documento Word...");
  try {
    const res = await fetch("/api/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Error desconocido");
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `QA_Audit_Report_${payload.cliente || "cliente"}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    out.innerHTML = `<div class="summary">✓ Reporte generado y descargado.</div>`;
  } catch (err) {
    setError(out, err.message);
  } finally {
    btn.disabled = false;
  }
});
