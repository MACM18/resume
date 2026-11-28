import test from "node:test";
import assert from "node:assert/strict";
import { safeAdminReturnTo } from "../lib/login-redirect";

test("allows local admin routes with query and hash", () => {
  assert.equal(safeAdminReturnTo("/admin"), "/admin");
  assert.equal(safeAdminReturnTo("/admin/content/home?tab=hero#save"), "/admin/content/home?tab=hero#save");
});

test("rejects external, malformed, and non-admin return paths", () => {
  for (const candidate of ["https://attacker.example", "//attacker.example", "/", "/login", "/administrator", "/admin\\\\@attacker.example"]) {
    assert.equal(safeAdminReturnTo(candidate), "/admin", candidate);
  }
  assert.equal(safeAdminReturnTo(null), "/admin");
});
