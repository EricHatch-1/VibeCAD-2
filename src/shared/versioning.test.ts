import { describe, expect, it } from "vitest";
import { bumpVersion, formatVersionId, parseVersionId } from "./versioning";

describe("versioning", () => {
  it("parses version ids", () => {
    expect(parseVersionId("v1")).toEqual({ major: 1, minor: 0 });
    expect(parseVersionId("v2.3")).toEqual({ major: 2, minor: 3 });
    expect(parseVersionId("1")).toBeNull();
    expect(parseVersionId("v0")).toBeNull();
  });

  it("formats version ids", () => {
    expect(formatVersionId({ major: 1, minor: 0 })).toBe("v1");
    expect(formatVersionId({ major: 2, minor: 4 })).toBe("v2.4");
  });

  it("bumps versions", () => {
    expect(bumpVersion(null, "major")).toEqual({ major: 1, minor: 0 });
    expect(bumpVersion({ major: 1, minor: 0 }, "minor")).toEqual({ major: 1, minor: 1 });
    expect(bumpVersion({ major: 1, minor: 2 }, "major")).toEqual({ major: 2, minor: 0 });
  });
});
