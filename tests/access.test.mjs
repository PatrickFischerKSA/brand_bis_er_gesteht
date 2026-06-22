import test from "node:test";
import assert from "node:assert/strict";
import { hasOpenAccess, isSafeExamBrowserRequest, parseCookies } from "../src/services/access.mjs";

test("parseCookies extracts cookie values", () => {
  const cookies = parseCookies("foo=bar; open_access=1");
  assert.equal(cookies.foo, "bar");
  assert.equal(cookies.open_access, "1");
});

test("hasOpenAccess checks reader cookie", () => {
  const request = {
    headers: {
      cookie: "open_access=1"
    }
  };

  assert.equal(hasOpenAccess(request), true);
});

test("isSafeExamBrowserRequest detects SEB user agent", () => {
  const request = {
    headers: {
      "user-agent": "Mozilla/5.0 SafeExamBrowser/3.6"
    }
  };

  assert.equal(isSafeExamBrowserRequest(request), true);
});

test("isSafeExamBrowserRequest enforces config hash when provided", () => {
  const request = {
    headers: {
      "user-agent": "SafeExamBrowser/3.6",
      "x-safeexambrowser-configkeyhash": "abc123"
    }
  };

  assert.equal(isSafeExamBrowserRequest(request, "abc123"), true);
  assert.equal(isSafeExamBrowserRequest(request, "different"), false);
});
