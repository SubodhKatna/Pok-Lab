import fs from "node:fs";

const verbs = ["Implement", "Fix", "Add", "Refactor", "Update", "Push"];
const firstLineMax = 72;

const msgFile = process.argv[2];
if (!msgFile) {
  console.error("Missing commit message file path (git passes this as $1).");
  process.exit(1);
}

let msg = "";
try {
  msg = fs.readFileSync(msgFile, "utf8");
} catch (e) {
  console.error("Unable to read commit message file:", msgFile);
  console.error(String(e?.message ?? e));
  process.exit(1);
}

const firstLine = msg.split(/\r?\n/, 1)[0].trimEnd();

if (!firstLine) {
  console.error("Commit message must not be empty.");
  process.exit(1);
}

if (firstLine.length > firstLineMax) {
  console.error(`Commit message must be ${firstLineMax} characters or less.`);
  console.error(`Got ${firstLine.length}: ${firstLine}`);
  process.exit(1);
}

if (firstLine.endsWith(".")) {
  console.error("Commit message must not end with a period.");
  console.error(`Got: ${firstLine}`);
  process.exit(1);
}

const verbRe = new RegExp(`^(${verbs.join("|")})\\b`);
if (!verbRe.test(firstLine)) {
  console.error("Commit message must start with an imperative verb such as:");
  console.error(`  ${verbs.join(", ")}`);
  console.error("");
  console.error("Examples:");
  console.error("  Implement basic service discovery");
  console.error("  Fix auth exception");
  console.error("  Add rabbitmq health check");
  console.error("  Push validation");
  process.exit(1);
}

