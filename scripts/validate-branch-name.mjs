import { execSync } from "node:child_process";

const allowed = /^(main|(?:feature|fix|chore|docs|refactor|test)\/[a-z0-9]+(?:-[a-z0-9]+)*)$/;

function getBranchName() {
  try {
    // Empty output means detached HEAD; don't block in that case.
    return execSync("git symbolic-ref --short -q HEAD", {
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim();
  } catch {
    // If git isn't available or we're not in a git repo, don't block.
    return "";
  }
}

const branch = getBranchName();
if (!branch) process.exit(0);

if (!allowed.test(branch)) {
  console.error("Invalid branch name:", branch);
  console.error("");
  console.error("Allowed branch names:");
  console.error("  main");
  console.error("  feature/task-name");
  console.error("  fix/task-name");
  console.error("  chore/task-name");
  console.error("  docs/task-name");
  console.error("  refactor/task-name");
  console.error("  test/task-name");
  console.error("");
  console.error("The branch suffix must be kebab-case (lowercase letters/numbers with hyphens).");
  process.exit(1);
}

