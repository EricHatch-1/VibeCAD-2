import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { getProjectsRoot } from "./projectPaths";
import { getProjectIndex } from "./projectIndex";
import { applyProjectDefaults } from "../shared/project";
import { normalizeProjectName } from "../shared/projectName";
import { ensureWithinRoot } from "./projectPaths";

export type CreateProjectPayload = {
  name: string;
  entrypoint?: string;
  units?: "mm" | "in";
};

export const createProject = async ({ name, entrypoint, units }: CreateProjectPayload) => {
  const projectId = randomUUID();
  const createdAt = new Date().toISOString();
  const resolvedEntrypoint = entrypoint ?? "src/main.scad";
  const resolvedName = normalizeProjectName(name);
  if (path.isAbsolute(resolvedEntrypoint)) {
    throw new Error("Entrypoint must be a relative path");
  }
  const normalizedEntrypoint = path.normalize(resolvedEntrypoint);
  if (normalizedEntrypoint.startsWith("..") || path.isAbsolute(normalizedEntrypoint)) {
    throw new Error("Entrypoint must be within project root");
  }

  const index = getProjectIndex();
  const record = index.createProject({
    project_id: projectId,
    name: resolvedName,
    entrypoint: normalizedEntrypoint,
    created_at: createdAt
  });

  const projectRoot = path.join(getProjectsRoot(), projectId);
  await fs.mkdir(projectRoot, { recursive: true });
  const entrypointPath = ensureWithinRoot(projectRoot, path.join(projectRoot, normalizedEntrypoint));

  const projectJson = applyProjectDefaults({
    project_id: projectId,
    name: resolvedName,
    created_at: createdAt,
    entrypoint: normalizedEntrypoint,
    units
  });

  await fs.writeFile(path.join(projectRoot, "project.json"), JSON.stringify(projectJson, null, 2));
  await fs.mkdir(path.join(projectRoot, "src"), { recursive: true });
  await fs.writeFile(
    entrypointPath,
    "// VibeCAD starter\n\n$fn = 64;\n\nmodule main() {\n  cube([20, 20, 10], center = true);\n}\n\nmain();\n"
  );

  return record;
};
