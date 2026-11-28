import test from "node:test";
import assert from "node:assert/strict";
import { projectImageUrl } from "../lib/project-images";

test("removes the legacy placeholder path and its URL variants", () => {
  for (const value of [
    "/placeholder.svg",
    "placeholder.svg",
    "/placeholder.svg?width=800",
    "https://macm.dev/placeholder.svg",
    "https://cdn.example.com/assets/placeholder.svg#preview",
  ]) {
    assert.equal(projectImageUrl(value), null, `${value} should be treated as missing media`);
  }
});

test("preserves real project image URLs and handles empty values", () => {
  assert.equal(projectImageUrl("  "), null);
  assert.equal(projectImageUrl(null), null);
  assert.equal(projectImageUrl("https://cdn.macm.dev/project.webp"), "https://cdn.macm.dev/project.webp");
});

test("handles long slash-heavy paths without regex processing", () => {
  const trailingSlashes = "/placeholder.svg" + "/".repeat(250_000);
  const slashOnly = "/".repeat(250_000);

  assert.equal(projectImageUrl(trailingSlashes), null);
  assert.equal(projectImageUrl(slashOnly), slashOnly);
});
