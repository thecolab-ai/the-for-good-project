#!/usr/bin/env bash
# Regression test for the #290 artifact/placeholder gate in
# scripts/validate-findings.mjs: a finding carrying a tool-wrapper tag or a
# placeholder citation must FAIL validation; a clean finding must PASS.
# Runs the real validator against fixture content in a temp dir.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/fg-validate-test.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$TMP/research/findings/other"

write_finding() {  # $1 = path, $2 = extra body text
  cat >"$1" <<EOF
---
title: "Test finding"
issue: "#1"
author: "tester"
agent: "claude"
model: "test-model"
date: 2026-07-03
domain: other
confidence: Medium
---

## Executive answer

A claim with a real citation [Stats NZ](https://www.stats.govt.nz/example-page).

$2

## What would change this conclusion

Nothing.

## Sources

- [Stats NZ](https://www.stats.govt.nz/example-page)
EOF
}

run_validator() { (cd "$TMP" && node "$ROOT/scripts/validate-findings.mjs"); }

fail() { echo "FAIL: $*" >&2; exit 1; }

# 1) A clean finding passes.
write_finding "$TMP/research/findings/other/clean.md" "All good here."
run_validator >/dev/null || fail "clean finding should validate"

# 2) Each artifact/placeholder pattern fails. The tool-wrapper tag fixtures are
# assembled from pieces so this test file itself never contains a live tag.
lt="<"; gt=">"
bad_bodies=(
  "${lt}antml:invoke name=\"WebSearch\"${gt}"
  "${lt}function_results${gt}stuff"
  "${lt}/tool_use${gt}"
  "Result: [WebSearch for bed capacity...] showed 400 beds."
  "See [TODO: add citation] for details."
  "A standalone citation stub:

- [...]
"
  "A placeholder link [...](https://www.stats.govt.nz/page) here."
  "A dangling link [MSD report]()."
  "A placeholder link [MSD report](url)."
  "An example link [report](https://example.com/report)."
  "A bare stub [source] with no href."
)
i=0
for body in "${bad_bodies[@]}"; do
  i=$((i+1))
  write_finding "$TMP/research/findings/other/clean.md" "All good here."
  write_finding "$TMP/research/findings/other/bad.md" "$body"
  if run_validator >/dev/null 2>&1; then
    fail "fixture $i should have failed validation: $body"
  fi
  rm -f "$TMP/research/findings/other/bad.md"
done

# 3) Legit look-alikes still pass:
#    - reference-style/inline links named 'source', and a '[source]:' definition
#    - a bracketed ellipsis used as scholarly QUOTATION ELISION, mid-prose
#      (must NOT be flagged as a placeholder — the #312 review's key finding)
write_finding "$TMP/research/findings/other/clean.md" \
  "A real link [source](https://www.stats.govt.nz/page) and a ref-style [source][1].
The Act requires \"[...] reasonable compliance\" (s5), per [MSD][2].

[1]: https://www.stats.govt.nz/page
[2]: https://www.msd.govt.nz/page"
run_validator >/dev/null || fail "legit 'source' links + quotation elision should validate"

echo "validate-findings artifact-gate tests passed"
