import { test } from "node:test";
import assert from "node:assert/strict";
import { redactText, REDACTED } from "../clients/redact-patterns.mjs";

// Fixtures are assembled at runtime via j() so that none of these fake
// credentials appear contiguously in the source — GitHub push protection
// (rightly) refuses files containing things that look like live secrets.
const j = (...parts) => parts.join("");

/** The secret substring must be gone after redaction. */
function gone(input, secret) {
  const out = redactText(input);
  assert.ok(!out.includes(secret), `leaked ${JSON.stringify(secret)} in ${JSON.stringify(out)}`);
}

/** The line must pass through completely unchanged. */
function untouched(input) {
  assert.equal(redactText(input), input);
}

test("URL credentials (postgres/mysql/mongodb/redis/amqp)", () => {
  gone(j(`DATABASE_URL="postgres://app:`, `s3cr3t@db.internal:5432/prod"`), "s3cr3t");
  gone(j("mysql://root:", "hunter2@127.0.0.1/x"), "hunter2");
  gone(j("mongodb+srv://svc:", "p%40ss@cluster0.example.net/db"), "p%40ss");
  gone(j("redis://default:", "redispw@cache:6379"), "redispw");
  gone(j("amqp://guest:", "guestpw@mq:5672"), "guestpw");
  // user survives, password doesn't
  assert.equal(redactText(j("postgres://app:", "pw@h")), `postgres://app:${REDACTED}@h`);
});

test("AWS", () => {
  gone(j("aws configure set aws_access_key_id AKIA", "IOSFODNN7EXAMPLE"), "IOSFODNN7EXAMPLE");
  gone(j("ASIA", "Y34FZKBOKMUTVV7A is a session key id"), "Y34FZKBOKMUTVV7A");
  gone(j("aws_secret_access_key = ", `"wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"`), "wJalrXUtnFEMI");
  gone(j("AWS_SESSION_TOKEN=", "FQoGZXIvYXdzEBYaDzKcqLu9k1111EXAMPLE"), "FQoGZXIvYXdzEBYa");
});

test("private key and age/PGP blocks", () => {
  gone(j("-----BEGIN RSA PRIVATE KEY-----\n", "MIIEow==", "\n-----END RSA PRIVATE KEY-----"), "MIIEow==");
  gone(j("-----BEGIN OPENSSH PRIVATE KEY-----\n", "b3BlbnNzaA=="), "b3BlbnNzaA==");
  gone(j("-----BEGIN PGP PRIVATE KEY BLOCK-----\n", "lQdGBF==", "\n-----END PGP PRIVATE KEY BLOCK-----"), "lQdGBF==");
  gone(j("AGE-SECRET-KEY-1", "QQPZRW9DECISION8FANCYSTRINGVALUE0XYZ"), "QQPZRW9DECISION8");
});

test("GitHub / GitLab", () => {
  gone(j("token ghp_", "abcdefghijklmnopqrstuvwxyz123456"), "abcdefghijklmnopqrstuvwxyz123456");
  gone(j("github_pat_", "11ABCDEFG0_abcdefghijklmnopqrstuvwxyz"), "11ABCDEFG0");
  gone(j("glpat-", "XyZabc123defGHI456jkl"), "XyZabc123defGHI456jkl");
});

test("AI / SaaS vendor tokens", () => {
  gone(j("sk-", "ant-api03-abcdefghijklmnopqrstuvwx"), "ant-api03");
  gone(j("OPENAI: sk-", "proj-AbCdEfGhIjKlMnOpQrSt"), "proj-AbCdEfGh");
  gone(j("hf_", "AbCdEfGhIjKlMnOpQrStUv"), "AbCdEfGhIjKlMnOpQrStUv");
  gone(j("stripe sk_live_", "4eC39HqLyjWDarjtT1zdp7dc"), "4eC39HqLyjWDarjtT1zdp7dc");
  gone(j("whsec_", "AbCdEfGhIjKlMnOpQrSt"), "AbCdEfGhIjKlMnOpQrSt");
  gone(j("key AIza", "SyA-1234567890abcdefghijklmnopqrstu in config"), "SyA-1234567890");
  gone(j("ya29", ".a0AbCdEfGhIjKlMnOpQrStUvWxYz123"), ".a0AbCdEfGh");
  gone(j("SG", ".AbCdEfGhIjKlMnOp_r.QrStUvWxYz0123456789-_abc"), ".AbCdEfGhIjKlMnOp_r");
  gone(j("npm_", "AbCdEfGhIjKlMnOpQrStUvWxYz0123456789"), "AbCdEfGhIjKlMnOpQrStUvWxYz0123456789");
  gone(j("dapi", "0123456789abcdef0123456789abcdef"), "0123456789abcdef0123456789abcdef");
});

test("Azure connection strings and SAS", () => {
  gone(
    j("DefaultEndpointsProtocol=https;AccountName=x;AccountKey=", "AbCdeFgH0123456789==;EndpointSuffix=core.windows.net"),
    "AbCdeFgH0123456789",
  );
  gone(j("https://acc.blob.core.windows.net/c/b?sv=2021&sig=", "AbCdEf%2BgHiJkLmNoPqRsTuVw%3D%3D"), "AbCdEf%2BgHiJkLm");
});

test("webhook URLs are credentials", () => {
  gone(j("https://hooks.slack.com/services/", "T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX"), "T00000000");
  gone(j("https://discord.com/api/webhooks/", "123456789012345678/aBcDeF-gHiJkLmN"), "aBcDeF-gHiJkLmN");
  gone(j("xoxb-", "1234567890-abcdefghijkl"), "1234567890-abcdefghijkl");
  gone(j("110201543:AA", "HdqTcvCH1vGWJxfSeofSAs0K5PALDsaw"), "HdqTcvCH1vGWJxfSeofSAs0K5PALDsaw");
});

test("JWTs and auth headers", () => {
  gone(
    j("Authorization: Bearer eyJ", "hbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N"),
    "dozjgNryP4J3jVmNHl0w5N",
  );
  gone(j("basic ", "dXNlcjpwYXNzd29yZDEyMw=="), "dXNlcjpwYXNzd29yZDEyMw==");
});

test("secret-bearing name = value, quoted and unquoted", () => {
  gone(j(`MY_SECRET="`, `hunter2"`), "hunter2");
  gone(j(`"password": "`, `hunter2"`), "hunter2");
  gone(j("export DB_PASSWORD='", "topsecret'"), "topsecret");
  gone(j("PASSPHRASE: ", "correct-horse-battery"), "correct-horse-battery");
  gone(j("MYSQL_PWD=", "rootpw123"), "rootpw123");
  gone(j("SENTRY_DSN=https://", "abc123@o0.ingest.sentry.io/1"), "abc123");
  gone(j("SIGNING_KEY: ", "0xdeadbeefcafe"), "0xdeadbeefcafe");
});

test("normal text is untouched", () => {
  untouched("no secrets here at all");
  untouched("see https://example.com/path?x=1 for docs");
  untouched("commit 3f786850e387550fdab836ed7e6dc881de23001b fixed it");
  untouched("PWD=/home/user/the-for-good-project");
  untouched("monkey=banana tastes fine");
});

test("acceptable over-redaction: names that merely CONTAIN a secret keyword", () => {
  // TOKENIZER contains TOKEN, so it matches the name rule. We accept this
  // trade deliberately — a garbled feed line beats a leaked credential.
  assert.ok(redactText("TOKENIZER=whitespace").includes(REDACTED));
});
