import { describe, expect, it } from "vitest";
import { findOpenScadBinary } from "./openscadLocator";

const makeExecChecker = (available: Set<string>) => (candidate: string) => available.has(candidate);

const makeWhich = (value: string | null) => () => value;

describe("findOpenScadBinary", () => {
  it("prefers macOS app bundle when executable", () => {
    const macPath = "/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD";
    const result = findOpenScadBinary({
      platform: "darwin",
      configuredPath: "/custom/openscad",
      isExecutable: makeExecChecker(new Set([macPath])),
      resolveWhich: makeWhich("/usr/local/bin/openscad")
    });

    expect(result).toBe(macPath);
  });

  it("falls back to configured path", () => {
    const configured = "/opt/openscad";
    const result = findOpenScadBinary({
      platform: "linux",
      configuredPath: configured,
      isExecutable: makeExecChecker(new Set([configured])),
      resolveWhich: makeWhich(null)
    });

    expect(result).toBe(configured);
  });

  it("uses PATH resolution when others unavailable", () => {
    const pathResolved = "/usr/bin/openscad";
    const result = findOpenScadBinary({
      platform: "linux",
      isExecutable: makeExecChecker(new Set([pathResolved])),
      resolveWhich: makeWhich(pathResolved)
    });

    expect(result).toBe(pathResolved);
  });

  it("returns null when nothing executable", () => {
    const result = findOpenScadBinary({
      platform: "linux",
      configuredPath: "/missing/openscad",
      isExecutable: makeExecChecker(new Set()),
      resolveWhich: makeWhich(null)
    });

    expect(result).toBeNull();
  });
});
