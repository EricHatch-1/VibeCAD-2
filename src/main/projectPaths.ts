import { app } from "electron";
import fs from "node:fs";
import path from "node:path";

export const getAppDataDir = () => path.join(app.getPath("userData"), "vibecad");

export const getProjectLibraryPath = () => path.join(getAppDataDir(), "library.sqlite");

export const getProjectsRoot = () => path.join(getAppDataDir(), "projects");

export const ensureAppPaths = () => {
  fs.mkdirSync(getAppDataDir(), { recursive: true });
  fs.mkdirSync(getProjectsRoot(), { recursive: true });
};
