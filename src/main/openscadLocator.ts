import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

export type OpenScadLocateOptions = {
  configuredPath?: string | null;
  platform?: NodeJS.Platform;
  isExecutable?: (candidate: string) => boolean;
  resolveWhich?: (command: string) => string | null;
};

const defaultIsExecutable = (candidate: string) => {
  try {
    fs.accessSync(candidate, fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
};

const defaultResolveWhich = (command: string) => {
  try {
    const result = execSync(`command -v ${command}`, { encoding: "utf8" }).trim();
    return result.length > 0 ? result : null;
  } catch {
    return null;
  }
};

export const findOpenScadBinary = ({
  configuredPath,
  platform = process.platform,
  isExecutable = defaultIsExecutable,
  resolveWhich = defaultResolveWhich
}: OpenScadLocateOptions) => {
  const candidates: string[] = [];

  if (platform === "darwin") {
    candidates.push("/Applications/OpenSCAD.app/Contents/MacOS/OpenSCAD");
  }

  if (configuredPath) {
    candidates.push(configuredPath);
  }

  const pathResolved = resolveWhich("openscad");
  if (pathResolved) {
    candidates.push(pathResolved);
  }

  for (const candidate of candidates) {
    const normalized = path.resolve(candidate);
    if (isExecutable(normalized)) {
      return normalized;
    }
  }

  return null;
};
