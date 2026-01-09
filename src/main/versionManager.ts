import fs from "node:fs/promises";
import path from "node:path";
import { getProjectIndex } from "./projectIndex";
import { resolveProjectPath } from "./projectFiles";
import { bumpVersion, formatVersionId, parseVersionId } from "../shared/versioning";

export type VersionRecord = {
  versionId: string;
  parentVersionId: string | null;
  summary: string;
  createdAt: string;
};

const getProjectRoot = (projectId: string) => {
  const project = getProjectIndex().getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  return project.path;
};

const getVersionsRoot = (projectId: string) => {
  return path.join(getProjectRoot(projectId), "versions");
};

export const commitVersion = async ({
  projectId,
  parentVersionId,
  bump,
  summary
}: {
  projectId: string;
  parentVersionId: string | null;
  bump: "major" | "minor";
  summary: string;
}) => {
  const parentParts = parentVersionId ? parseVersionId(parentVersionId) : null;
  const nextParts = bumpVersion(parentParts, bump);
  const versionId = formatVersionId(nextParts);
  const createdAt = new Date().toISOString();

  const projectRoot = getProjectRoot(projectId);
  const srcRoot = resolveProjectPath(projectId, "src");
  const versionsRoot = getVersionsRoot(projectId);
  const versionRoot = path.join(versionsRoot, versionId);
  const srcSnapshot = path.join(versionRoot, "src_snapshot");

  await fs.mkdir(srcSnapshot, { recursive: true });
  await fs.cp(srcRoot, srcSnapshot, { recursive: true });

  const versionRecord: VersionRecord = {
    versionId,
    parentVersionId,
    summary,
    createdAt
  };

  await fs.writeFile(
    path.join(versionRoot, "version.json"),
    JSON.stringify(versionRecord, null, 2)
  );

  await fs.mkdir(path.join(projectRoot, "cache"), { recursive: true });

  return versionRecord;
};

export const checkoutVersion = async ({
  projectId,
  versionId
}: {
  projectId: string;
  versionId: string;
}) => {
  const projectRoot = getProjectRoot(projectId);
  const versionRoot = path.join(getVersionsRoot(projectId), versionId);
  const srcSnapshot = path.join(versionRoot, "src_snapshot");
  const srcRoot = resolveProjectPath(projectId, "src");

  await fs.rm(srcRoot, { recursive: true, force: true });
  await fs.mkdir(srcRoot, { recursive: true });
  await fs.cp(srcSnapshot, srcRoot, { recursive: true });

  await fs.mkdir(path.join(projectRoot, "cache"), { recursive: true });
};
