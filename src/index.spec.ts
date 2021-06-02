import { yarnLockCheck } from "./";
import path from "path";

function useFixture(fixture: string) {
  process.chdir(path.resolve(__dirname, "fixtures", fixture));
}

describe("yarnLockCheck", () => {
  it("does not throw if all registries match", () => {
    useFixture("ok");

    expect(() => yarnLockCheck("https://registry.com")).not.toThrow();
  });

  it("throws if any yaml.locks contains wrong registries", () => {
    useFixture("error");

    expect(() => yarnLockCheck("https://registry.com"))
      .toThrowErrorMatchingInlineSnapshot(`
"
You pushed changes to the yarn.lock with the wrong registry.
Please ensure your registry is set to https://registry.com:


packages/package-error/yarn.lock
    https://wrong-registry.com/test-lib

yarn.lock
    https://wrong-registry.com/test-lib"
`);
  });
});
