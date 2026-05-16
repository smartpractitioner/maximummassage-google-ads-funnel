import XLSX from "xlsx";
const wb = XLSX.readFile("reports-workspace/data/quiz data/Maximum Health - Click Funnel Form Fill Data April to May 16th 2026.csv");
const sheet = wb.Sheets[wb.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });
const PAIN_KEY = Object.keys(rows[0]).find(k => k.toLowerCase().includes("pain level"));

const escape = (s) => (s == null ? "" : String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"'));
const fmt = (s) => `"${escape(s)}"`;

const lines = [];
for (const r of rows) {
  if (!r.Q1) continue;
  lines.push(`  { Q1:${fmt(r.Q1)}, Q2:${fmt(r.Q2)}, pain:${Number(r[PAIN_KEY]) || 0}, Q3:${fmt(r.Q3 || "")}, Q4:${fmt(r.Q4 || "")}, source:${fmt(r.gclid ? "paid" : "organic")}, keyword:${fmt(r.utm_term || "")} },`);
}
console.log(`// ${lines.length} rows`);
console.log(lines.join("\n"));
