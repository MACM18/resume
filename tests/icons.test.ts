import test from "node:test";
import assert from "node:assert/strict";
import { getDynamicIcon, portfolioIconOptions } from "../lib/icons";

test("keeps saved social and skill icons readable without changing stored values", () => {
  for (const legacyName of [
    "Fa.FaGithub",
    "Fa.FaLinkedinIn",
    "Bs.BsTwitterX",
    "Gi.GiCloudUpload",
    "Fa.FaServer",
    "Fa.FaCode",
  ]) {
    assert.ok(getDynamicIcon(legacyName), `${legacyName} should resolve`);
  }
});

test("exposes only the curated icon set to the editor", () => {
  assert.equal(portfolioIconOptions.length, 38);
  assert.ok(getDynamicIcon("Fa.FaGithub"));
  assert.equal(getDynamicIcon("Unknown.Icon"), undefined);
});
