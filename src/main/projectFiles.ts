import fs from "node:fs/promises";
import path from "node:path";
import type { FileNode } from "../shared/ipc";
import { getProjectIndex } from "./projectIndex";

const ensureWithinRoot = (root: string, target: string) => {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  const relative = path.relative(resolvedRoot, resolvedTarget);
  if (relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== ".." && !path.isAbsolute(relative))) {
    return resolvedTarget;
  }
  throw new Error("Path escapes project root");
};

export const resolveProjectPath = (projectId: string, relativePath = "") => {
  const project = getProjectIndex().getProject(projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  const target = path.join(project.path, relativePath);
  return ensureWithinRoot(project.path, target);
};

export const readProjectFile = async (projectId: string, filePath: string) => {
  const fullPath = resolveProjectPath(projectId, filePath);
  return fs.readFile(fullPath, "utf8");
};

export const writeProjectFile = async (projectId: string, filePath: string, text: string) => {
  const fullPath = resolveProjectPath(projectId, filePath);
  await fs.mkdir(path.dirname(fullPath), { recursive: true });
  await fs.writeFile(fullPath, text, "utf8");
};

const buildFileNode = async (absolutePath: string, basePath: string): Promise<FileNode> => {
  const stat = await fs.stat(absolutePath);
  const relative = path.relative(basePath, absolutePath);
  const name = path.basename(absolutePath);

  if (stat.isDirectory()) {
    const entries = await fs.readdir(absolutePath);
    const children = await Promise.all(
      entries.map((entry) => buildFileNode(path.join(absolutePath, entry), basePath))
    );
    return {
      path: relative,
      name,
      type: "directory",
      children
    };
  }

  return {
    path: relative,
    name,
    type: "file"
  };
};

export const listProjectFiles = async (projectId: string, root: string) => {
  const basePath = resolveProjectPath(projectId, root);
  const exists = await fs
    .stat(basePath)
    .then(() => true)
    .catch(() => false);
  if (!exists) {
    return [];
  }
  const entries = await fs.readdir(basePath);
  return Promise.all(entries.map((entry) => buildFileNode(path.join(basePath, entry), basePath)));
};
