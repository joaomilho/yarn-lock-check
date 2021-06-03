#!/usr/bin/env node

import fs from "fs";
import * as lockfile from "@yarnpkg/lockfile";
import ini from "ini";
import glob from "glob";
import path from "path";
import os from "os";

const root = os.platform() == "win32" ? process.cwd().split(path.sep)[0] : "/";

function findUp(fileName: string): string | void {
  let currentFolder = path.resolve();

  while (currentFolder !== root && currentFolder !== "") {
    const currentPath = path.join(currentFolder, fileName);
    if (fs.existsSync(currentPath)) return currentPath;
    currentFolder = currentFolder.split(path.sep).slice(0, -1).join(path.sep);
  }
}

let npmRcPath;

export function yarnLockCheck(
  registry = (npmRcPath = findUp(".npmrc"))
    ? ini.parse(fs.readFileSync(npmRcPath, "utf8")).registry
    : undefined
): void {
  const lockFiles = glob.sync("**/yarn.lock", {
    ignore: ["**/node_modules/**", "./node_modules/**"],
  });

  const errors: Record<string, string[]> = {};

  for (let lockFile of lockFiles) {
    const lock = lockfile.parse(fs.readFileSync(lockFile, "utf8"));

    const urlsWithWrongRegistry = Object.values(
      lock.object as lockfile.LockFileObject
    )
      .map((item) => item.resolved)
      .filter(Boolean)
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
${errorList}

`;

    throw new Error(message);
  }
}

if (require.main === module) {
  yarnLockCheck();
}
