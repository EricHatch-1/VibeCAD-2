export enum IpcChannel {
  ListProjects = "projects:list",
  CreateProject = "projects:create",
  OpenProject = "projects:open",
  ListFiles = "files:list",
  ReadFile = "files:read",
  WriteFile = "files:write",
  RunOpenScad = "openscad:run",
  CommitVersion = "versions:commit",
  CheckoutVersion = "versions:checkout",
  GetSelectionContext = "selection:get",
  SaveSelectionSnapshot = "selection:snapshot",
  BuildProject = "build:project"
}

export type ProjectListItem = {
  project_id: string;
  name: string;
  path: string;
  entrypoint: string;
  created_at: string;
  updated_at: string;
  last_opened_at: string | null;
  thumbnail_path: string | null;
  deleted_at: string | null;
};

export type OpenProjectRequest = {
  projectId: string;
};

export type CreateProjectRequest = {
  name: string;
  entrypoint?: string;
  units?: "mm" | "in";
};

export type CreateProjectResult = {
  project: ProjectListItem;
};

export type FileNode = {
  path: string;
  name: string;
  type: "file" | "directory";
  children?: FileNode[];
};

export type RunOpenScadRequest = {
  projectId: string;
  entrypoint: string;
  defines?: Record<string, string | number | boolean>;
  backend?: "cgal" | "manifold";
  timeoutSec?: number;
};

export type BuildResult = {
  versionId: string;
  exitCode: number;
  logPath: string;
  summaryPath: string | null;
  previewPath: string | null;
  stlPath: string | null;
  durationMs: number;
  backend: "cgal" | "manifold";
  defines?: Record<string, string | number | boolean>;
};

export type CommitVersionRequest = {
  projectId: string;
  parentVersionId: string | null;
  bump: "major" | "minor";
  summary: string;
};

export type CommitVersionResult = {
  versionId: string;
};

export type VersionCheckoutRequest = {
  projectId: string;
  versionId: string;
};

export type SelectionContext = {
  hitPoint: [number, number, number];
  normal: [number, number, number];
  faceIndex: number;
  timestamp: string;
  previewPath?: string;
};

export type BuildRequest = {
  projectId: string;
  entrypoint: string;
  backend: "cgal" | "manifold";
  timeoutSec?: number;
  defines?: Record<string, string | number | boolean>;
};
