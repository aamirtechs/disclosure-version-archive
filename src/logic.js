"use strict";
function fnv1aHash(text) {
  let hash = 0x811c9dc5;
  const s = String(text || "");
  for (let i = 0; i < s.length; i++) {
    hash ^= s.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
    // Mix in UTF-16 high bytes indirectly via a second pass on longer strings is unnecessary for a tamper-evident manifest baseline.
  }
  return ("0000000" + hash.toString(16)).slice(-8);
}
function normalizeVersion(v) {
  if (!v || !v.form_name || !v.version_label || !v.effective_from || v.plain_text == null) throw new Error("Version needs form_name, version_label, effective_from and plain_text");
  return { form_name: String(v.form_name), version_label: String(v.version_label), effective_from: String(v.effective_from), effective_to: v.effective_to ? String(v.effective_to) : "", plain_text: String(v.plain_text), change_note: String(v.change_note || "") };
}
function withHash(v) { const n = normalizeVersion(v); return Object.assign({}, n, { hash: fnv1aHash(n.plain_text) }); }
function buildManifest(versions) {
  return (versions || []).map(withHash).sort((a, b) => a.form_name.localeCompare(b.form_name) || a.effective_from.localeCompare(b.effective_from));
}
function rangeOf(v) { return { from: v.effective_from, to: v.effective_to || "9999-12-31" }; }
function validateArchive(versions) {
  const list = (versions || []).map(normalizeVersion); const issues = [];
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], b = list[j]; if (a.form_name !== b.form_name) continue;
    const ra = rangeOf(a), rb = rangeOf(b);
    if (ra.from <= rb.to && rb.from <= ra.to) issues.push({ type: "overlap", form_name: a.form_name, versions: [a.version_label, b.version_label], message: "Overlapping effective ranges for " + a.form_name + ": " + a.version_label + " and " + b.version_label });
  }
  for (const v of list) if (v.effective_to && v.effective_to < v.effective_from) issues.push({ type: "invalid-range", form_name: v.form_name, versions: [v.version_label], message: "effective_to is before effective_from for " + v.version_label });
  return { valid: issues.length === 0, issues, manifest: buildManifest(list) };
}
function lookupVersion(versions, formName, dateISO) {
  const candidates = (versions || []).map(normalizeVersion).filter((v) => v.form_name === formName && v.effective_from <= dateISO && (!v.effective_to || dateISO <= v.effective_to));
  if (!candidates.length) return null;
  candidates.sort((a, b) => b.effective_from.localeCompare(a.effective_from));
  return withHash(candidates[0]);
}
function tokenize(text) { return String(text || "").split(/\s+/).filter(Boolean); }
function diffWords(oldText, newText) {
  const a = tokenize(oldText), b = tokenize(newText);
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) for (let j = n - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const raw = []; let i = 0, j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) { raw.push({ type: "same", text: a[i] }); i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { raw.push({ type: "removed", text: a[i] }); i++; }
    else { raw.push({ type: "added", text: b[j] }); j++; }
  }
  while (i < m) { raw.push({ type: "removed", text: a[i] }); i++; }
  while (j < n) { raw.push({ type: "added", text: b[j] }); j++; }
  const segments = [];
  for (const seg of raw) {
    if (segments.length && segments[segments.length - 1].type === seg.type) segments[segments.length - 1].text += " " + seg.text;
    else segments.push({ type: seg.type, text: seg.text });
  }
  return segments;
}
function diffSummary(oldText, newText) {
  const segs = diffWords(oldText, newText);
  let added = 0, removed = 0;
  for (const s of segs) { const c = tokenize(s.text).length; if (s.type === "added") added += c; if (s.type === "removed") removed += c; }
  return { added, removed, segments: segs };
}
function exportArchive(versions) { return JSON.stringify({ versions: buildManifest(versions) }, null, 2); }
function importArchive(json) {
  const parsed = JSON.parse(json);
  const list = Array.isArray(parsed) ? parsed : parsed.versions;
  if (!Array.isArray(list)) throw new Error("Archive JSON needs a versions array");
  return list.map(normalizeVersion);
}
const api = { fnv1aHash, normalizeVersion, withHash, buildManifest, validateArchive, lookupVersion, tokenize, diffWords, diffSummary, exportArchive, importArchive };
if (typeof module !== "undefined" && module.exports) { module.exports = api; }
if (typeof window !== "undefined") { window.DisclosureVersionArchive = api; }
