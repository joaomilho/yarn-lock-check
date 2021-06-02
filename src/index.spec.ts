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

  it("does not throw if packages have no resolve field", () => {
    useFixture("internal");

    expect(() => yarnLockCheck("https://registry.com")).not.toThrow();
  });

  it("throws if any yaml.locks contains wrong registries", () => {
    useFixture("error");

    expect(() =>
      yarnLockCheck("https://registry.com")
    ).toThrowErrorMatchingSnapshot();
  });
});
