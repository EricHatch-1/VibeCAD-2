import { describe, expect, it } from "vitest";
import { normalizeProjectName } from "./projectName";

describe("normalizeProjectName", () => {
  it("trims and collapses whitespace", () => {
    expect(normalizeProjectName("  My   Project  ")).toBe("My Project");
  });

  it("falls back when empty", () => {
    expect(normalizeProjectName("   ", "Fallback")).toBe("Fallback");
  });
});
