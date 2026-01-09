import { describe, expect, it, vi } from "vitest";

vi.mock("./projectIndex", () => ({
  getProjectIndex: () => ({
    getProject: (projectId: string) => ({
      project_id: projectId,
      name: "Test",
      path: "/tmp/vibecad/project",
      entrypoint: "src/main.scad",
      created_at: "2024-01-01",
      updated_at: "2024-01-01",
      last_opened_at: null,
      thumbnail_path: null,
      deleted_at: null
    })
  })
}));

vi.mock("./projectFiles", () => ({
  resolveProjectPath: (_projectId: string, relativePath: string) =>
    `/tmp/vibecad/project/${relativePath}`
}));

const fsCalls: string[] = [];

vi.mock("node:fs/promises", () => ({
  default: {},
  mkdir: async (target: string) => {
    fsCalls.push(`mkdir:${target}`);
  },
  cp: async (from: string, to: string) => {
    fsCalls.push(`cp:${from}->${to}`);
  },
  writeFile: async (target: string) => {
    fsCalls.push(`writeFile:${target}`);
  },
  rm: async (target: string) => {
    fsCalls.push(`rm:${target}`);
  }
}));

import { commitVersion, checkoutVersion } from "./versionManager";

describe("versionManager", () => {
  it("writes version snapshot and metadata", async () => {
    const record = await commitVersion({
      projectId: "p1",
      parentVersionId: null,
      bump: "major",
      summary: "Initial"
    });

    expect(record.versionId).toBe("v1");
    expect(fsCalls).toContain("cp:/tmp/vibecad/project/src->/tmp/vibecad/project/versions/v1/src_snapshot");
    expect(fsCalls).toContain("writeFile:/tmp/vibecad/project/versions/v1/version.json");
  });

  it("restores snapshot on checkout", async () => {
    await checkoutVersion({ projectId: "p1", versionId: "v1" });
    expect(fsCalls).toContain("rm:/tmp/vibecad/project/src");
    expect(fsCalls).toContain("cp:/tmp/vibecad/project/versions/v1/src_snapshot->/tmp/vibecad/project/src");
  });
});
