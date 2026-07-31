# DragonflAI QA Toolkit — uso personal

Dashboard local (solo para ti) con 7 agentes de QA potenciados con Claude:

1. **Generador de Playwright** — describe un flujo, obtén el script.
2. **Casos de prueba de API** — pega un endpoint/OpenAPI/Postman, obtén casos de prueba.
3. **Escaneo de accesibilidad** — corre axe-core real sobre una URL viva + resumen en español.
4. **Revisión de UX/UI** — sube una captura, recibe feedback específico.
5. **Casos de prueba funcionales** — pega una historia de usuario/requerimiento, obtén el plan de pruebas.
6. **Reporte de bugs** — describe lo que viste, obtén el ticket completo (síntoma → diagnóstico → causa raíz → fix → verificación).
7. **Generador de reporte final (Word)** — junta los hallazgos que marques en los agentes 3 y 6 (botón "+ Agregar al reporte") y arma el documento de QA Audit Express, listo para descargar.

Todo corre en `localhost`. Tu API key vive solo en tu archivo `.env`, nunca se sube a GitHub ni se expone públicamente.

## Instalación (una sola vez)

```bash
# 1. Instala dependencias
npm install

# 2. Instala el navegador que usa el agente de accesibilidad (Playwright)
npm run install-browsers

# 3. Configura tu API key
cp .env.example .env
```

Abre `.env` y pon tu key real de Anthropic:

```
ANTHROPIC_API_KEY=sk-ant-tu-key-real
```

Puedes generar/copiar tu key desde la Consola de Anthropic (console.anthropic.com → API Keys).

## Uso diario

```bash
npm start
```

Abre tu navegador en **http://localhost:4141** y ya tienes los 4 agentes con botones, sin terminal.

## Notas

- **Costo**: cada llamada a Claude consume créditos de tu cuenta de Anthropic (paga por uso, no está incluido en tu suscripción de claude.ai). Los prompts están ajustados para ser eficientes, pero revisa tu consumo en la Consola si lo usas mucho.
- **Accesibilidad**: el escaneo con axe-core es real y automatizado, pero no reemplaza una revisión manual completa (navegación por teclado, lectores de pantalla).
- **Privacidad**: nada de esto se sube a ningún servidor tuyo ni de terceros más que la propia API de Anthropic para generar las respuestas.
- Si quieres subir este proyecto a un repo de GitHub (recomendado, para tenerlo respaldado), el `.gitignore` ya excluye `.env` y `node_modules` — revisa dos veces que `.env` nunca se incluya en un commit.

## Próximos pasos posibles

- Agregar un quinto agente que combine los 4 en un solo "audit" automático para tu servicio QA Audit Express.
- Guardar el historial de resultados en archivos locales (JSON) para armar reportes más rápido.
- Exportar directamente el resultado del escaneo de accesibilidad o UX a la plantilla de Word del QA Audit Express.
