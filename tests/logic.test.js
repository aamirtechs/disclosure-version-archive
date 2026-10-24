"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const L = require("../src/logic.js");
const V1 = { form_name: "main-funnel", version_label: "v1", effective_from: "2026-01-01", effective_to: "2026-06-30", plain_text: "Sample wording: we may contact you about your enquiry.", change_note: "Initial sample wording" };
const V2 = { form_name: "main-funnel", version_label: "v2", effective_from: "2026-07-01", effective_to: "", plain_text: "Sample wording: we may contact you by phone about your enquiry.", change_note: "Added by phone" };
test("FNV-1a hash is deterministic and changes with text", () => {
  assert.equal(L.fnv1aHash("hello world"), L.fnv1aHash("hello world"));
  assert.notEqual(L.fnv1aHash("hello world"), L.fnv1aHash("hello worle"));
  assert.match(L.fnv1aHash("anything"), /^[0-9a-f]{8}$/);
});
test("word diff reports added and removed segments", () => {
  const segs = L.diffWords("we may contact you", "we may phone you today");
  assert.ok(segs.some((s) => s.type === "added" && s.text.includes("phone")));
  assert.ok(segs.some((s) => s.type === "removed" && s.text.includes("contact")));
  const sum = L.diffSummary("we may contact you", "we may phone you today");
  assert.ok(sum.added >= 2); assert.ok(sum.removed >= 1);
});
test("identical texts diff to only same segments", () => {
  const segs = L.diffWords("same words here", "same words here");
  assert.ok(segs.every((s) => s.type === "same"));
});
test("lookup by date returns the version in effect", () => {
  assert.equal(L.lookupVersion([V1, V2], "main-funnel", "2026-03-15").version_label, "v1");
  assert.equal(L.lookupVersion([V1, V2], "main-funnel", "2026-09-01").version_label, "v2");
  assert.equal(L.lookupVersion([V1, V2], "main-funnel", "2025-01-01"), null);
  assert.match(L.lookupVersion([V1, V2], "main-funnel", "2026-03-15").hash, /^[0-9a-f]{8}$/);
});
test("manifest validation flags overlapping ranges for same form", () => {
  const overlap = { form_name: "main-funnel", version_label: "vX", effective_from: "2026-06-01", effective_to: "2026-08-01", plain_text: "Sample wording overlap.", change_note: "" };
  const out = L.validateArchive([V1, V2, overlap]);
  assert.equal(out.valid, false); assert.ok(out.issues.some((i) => i.type === "overlap"));
  assert.equal(L.validateArchive([V1, V2]).valid, true);
});
test("export and import roundtrip the archive", () => {
  const json = L.exportArchive([V1, V2]);
  const back = L.importArchive(json);
  assert.equal(back.length, 2); assert.equal(back[1].version_label, "v2");
  assert.ok(JSON.parse(json).versions[0].hash);
});
test("manifest is sorted and carries hashes", () => {
  const m = L.buildManifest([V2, V1]);
  assert.equal(m[0].version_label, "v1"); assert.ok(m.every((v) => /^[0-9a-f]{8}$/.test(v.hash)));
});
