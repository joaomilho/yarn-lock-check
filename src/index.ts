import fs from "fs";
import * as lockfile from "@yarnpkg/lockfile";
import ini from "ini";
import glob from "glob";

export function yarnLockCheck(
  registry = ini.parse(fs.readFileSync(".npmrc", "utf8")).registry
): void {
  const lockFiles = glob.sync("**/yarn.lock");

  const errors: Record<string, string[]> = {};

  for (let lockFile of lockFiles) {
    const lock = lockfile.parse(fs.readFileSync(lockFile, "utf8"));
    const urlsWithWrongRegistry = Object.values(
      lock.object as lockfile.LockFileObject
    )
      .map((item) => item.resolved)
      .filter((url) => !url?.startsWith(registry)) as string[];

    if (urlsWithWrongRegistry.length) errors[lockFile] = urlsWithWrongRegistry;
  }

  if (Object.keys(errors).length) {
    const errorList = Object.entries(errors)
      .map(([lockFile, urlsWithWrongRegistry]) => {
        return urlsWithWrongRegistry.length
          ? `\n${lockFile}\n    ${urlsWithWrongRegistry.join("\n    ")}`
          : "";
      })
      .join("\n");

    const message = `
You pushed changes to the yarn.lock with the wrong registry.
Please ensure your registry is set to ${registry}:

${errorList}`;

    throw new Error(message);
  }
}

if (require.main === module) {
  yarnLockCheck();
}
