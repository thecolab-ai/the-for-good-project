#!/usr/bin/env bash
# Tests for the secret-scrubbing gh shim (scripts/fg-secure/gh).
# Proves: (a) tokens are redacted from the body/title/body-file of pr|issue
# post commands, and (b) every other gh call — and every non-body arg — is
# passed through byte-for-byte untouched.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SHIM="$ROOT/scripts/fg-secure/gh"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/fg-gh-shim-test.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT

# Fake "real gh": records the argv it was handed, one arg per line.
REAL="$TMP/real-gh"
ARGS_OUT="$TMP/args.txt"
cat >"$REAL" <<EOF
#!/usr/bin/env bash
: > "$ARGS_OUT"
for a in "\$@"; do printf '%s\n' "\$a" >> "$ARGS_OUT"; done
EOF
chmod +x "$REAL"
export FG_REAL_GH="$REAL"

TOKEN="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"
PASS=0 FAIL=0
ok()   { PASS=$((PASS + 1)); printf '  ok   %s\n' "$1"; }
bad()  { FAIL=$((FAIL + 1)); printf '  FAIL %s\n' "$1"; }

# assert that $ARGS_OUT contains / does not contain a fixed string
has()    { grep -qF -- "$1" "$ARGS_OUT"; }

echo "shim: redacts tokens from post-command bodies"

"$SHIM" pr comment 585 --repo x/y --body "ran GITHUB_TOKEN=$TOKEN node scripts/build-data.mjs"
has "$TOKEN"            && bad "pr comment --body still contains the token"       || ok "pr comment --body token removed"
has "***REDACTED***"   && ok "pr comment --body redaction marker present"        || bad "pr comment --body not redacted"

"$SHIM" pr create --title "fix $TOKEN leak" --body "clean"
has "$TOKEN"           && bad "pr create --title still contains the token"        || ok "pr create --title token removed"

"$SHIM" issue comment 1 -b "raw $TOKEN here"
has "$TOKEN"           && bad "issue comment -b (short flag) still contains token" || ok "issue comment -b token removed"

# --body=inline form
"$SHIM" pr comment 2 --body="inline $TOKEN form"
has "$TOKEN"           && bad "--body= inline form still contains token"           || ok "--body= inline form redacted"

# fleet bearer token (fgt_<32hex>, ADR-0017)
FGT="fgt_0123456789abcdef0123456789abcdef"
"$SHIM" issue comment 5 --body "leaked $FGT here"
has "$FGT"             && bad "fleet fgt_ token still present"                      || ok "fleet fgt_ token redacted"

echo "shim: scrubs --body-file contents"
BODYF="$TMP/body.md"
printf 'line1\nGITHUB_TOKEN=%s node x\nline3\n' "$TOKEN" > "$BODYF"
"$SHIM" pr review 3 --request-changes --body-file "$BODYF"
# the real gh should have been pointed at a scrubbed temp file, not the original
scrubbed_path="$(tail -n1 "$ARGS_OUT")"
if [ -f "$scrubbed_path" ] && ! grep -qF -- "$TOKEN" "$scrubbed_path" && grep -qF 'line3' "$scrubbed_path"; then
  ok "--body-file content scrubbed (body preserved, token gone)"
else
  bad "--body-file content not scrubbed correctly"
fi
grep -qF -- "$TOKEN" "$BODYF" && ok "original --body-file left untouched on disk" || bad "original body file was mutated"

echo "shim: passes non-post commands through untouched"
# A token-looking value on a NON-gated command must survive verbatim.
"$SHIM" api -X POST "repos/x/y/statuses/$TOKEN" -f state=success
has "$TOKEN" && ok "gh api args passed through verbatim (not a publish path)" || bad "gh api args were mangled"

# issue edit is gated, but label args carry no token pattern → must be untouched.
"$SHIM" issue edit 4 --add-label "status: claimed" --remove-label "status: available"
has "status: claimed" && has "status: available" && ok "issue edit labels untouched" || bad "issue edit labels altered"

echo
if [ "$FAIL" -eq 0 ]; then
  echo "ALL $PASS checks passed."
else
  echo "$FAIL check(s) FAILED, $PASS passed." >&2
  exit 1
fi
