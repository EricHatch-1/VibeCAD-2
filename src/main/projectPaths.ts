import { app } from "electron";
import fs from "node:fs";
import path from "node:path";

export const getAppDataDir = () => path.join(app.getPath("userData"), "vibecad");

export const getProjectLibraryPath = () => path.join(getAppDataDir(), "library.sqlite");

export const getProjectsRoot = () => path.join(getAppDataDir(), "projects");

export const ensureWithinRoot = (root: string, target: string) => {
  const resolvedRoot = path.resolve(root);
  const resolvedTarget = path.resolve(target);
  const relative = path.relative(resolvedRoot, resolvedTarget);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Path escapes project root");
  }
  return resolvedTarget;
};

export const ensureAppPaths = () => {
  fs.mkdirSync(getAppDataDir(), { recursive: true });
  fs.mkdirSync(getProjectsRoot(), { recursive: true });
};
