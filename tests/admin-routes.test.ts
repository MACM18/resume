import test from "node:test";
import assert from "node:assert/strict";
import { isAdminPathname } from "../components/admin/admin-routes";

test("recognizes dashboard routes without matching similarly named public paths", () => {
  assert.equal(isAdminPathname("/admin"), true);
  assert.equal(isAdminPathname("/admin/content/home"), true);
  assert.equal(isAdminPathname("/administrator"), false);
  assert.equal(isAdminPathname("/contact"), false);
  assert.equal(isAdminPathname(null), false);
});
