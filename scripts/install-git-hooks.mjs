import { spawnSync } from "node:child_process";

if (!process.env.CI) {
  const repository = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

  if (repository.status === 0) {
    const result = spawnSync("git", ["config", "core.hooksPath", ".githooks"], {
      cwd: repository.stdout.trim(),
      stdio: "inherit",
    });
    process.exitCode = result.status ?? 1;
  }
}
