import { ipcMain } from "electron";
import {
  BuildRequest,
  BuildResult,
  CommitVersionRequest,
  CommitVersionResult,
  CreateProjectRequest,
  CreateProjectResult,
  FileNode,
  IpcChannel,
  OpenProjectRequest,
  ProjectListItem,
  RunOpenScadRequest,
  SelectionContext,
  VersionCheckoutRequest
} from "../shared/ipc";
import { createProject } from "./projectFactory";
import { listProjectFiles, readProjectFile, writeProjectFile } from "./projectFiles";
import { getProjectIndex } from "./projectIndex";
import { checkoutVersion, commitVersion } from "./versionManager";

const notImplemented = (name: string) =>
  new Error(`IPC handler for ${name} not implemented yet.`);

ipcMain.handle(IpcChannel.ListProjects, async (): Promise<ProjectListItem[]> => {
  return getProjectIndex().listProjects();
});

ipcMain.handle(
  IpcChannel.CreateProject,
  async (_event, payload: CreateProjectRequest): Promise<CreateProjectResult> => {
    const record = await createProject(payload);
    return { project: record };
  }
);

ipcMain.handle(IpcChannel.OpenProject, async (_event, payload: OpenProjectRequest) => {
  const index = getProjectIndex();
  const project = index.getProject(payload.projectId);
  if (!project) {
    throw new Error("Project not found");
  }
  index.markOpened(payload.projectId, new Date().toISOString());
});

ipcMain.handle(
  IpcChannel.ListFiles,
  async (_event, payload: { projectId: string; root: string }): Promise<FileNode[]> => {
    return listProjectFiles(payload.projectId, payload.root);
  }
);

ipcMain.handle(
  IpcChannel.ReadFile,
  async (_event, payload: { projectId: string; path: string }): Promise<string> => {
    return readProjectFile(payload.projectId, payload.path);
  }
);

ipcMain.handle(
  IpcChannel.WriteFile,
  async (_event, payload: { projectId: string; path: string; text: string }) => {
    await writeProjectFile(payload.projectId, payload.path, payload.text);
    getProjectIndex().touchProject(payload.projectId, new Date().toISOString());
  }
);

ipcMain.handle(
  IpcChannel.RunOpenScad,
  async (_event, _payload: RunOpenScadRequest): Promise<BuildResult> => {
    throw notImplemented("runOpenScad");
  }
);

ipcMain.handle(
  IpcChannel.CommitVersion,
  async (_event, payload: CommitVersionRequest): Promise<CommitVersionResult> => {
    const record = await commitVersion({
      projectId: payload.projectId,
      parentVersionId: payload.parentVersionId,
      bump: payload.bump,
      summary: payload.summary
    });
    return { versionId: record.versionId };
  }
);

ipcMain.handle(
  IpcChannel.CheckoutVersion,
  async (_event, payload: VersionCheckoutRequest) => {
    await checkoutVersion({ projectId: payload.projectId, versionId: payload.versionId });
  }
);

ipcMain.handle(
  IpcChannel.GetSelectionContext,
  async (): Promise<SelectionContext | null> => {
    throw notImplemented("getSelectionContext");
  }
);

ipcMain.handle(
  IpcChannel.SaveSelectionSnapshot,
  async (): Promise<string | null> => {
    throw notImplemented("saveSelectionSnapshot");
  }
);

ipcMain.handle(
  IpcChannel.BuildProject,
  async (_event, _payload: BuildRequest): Promise<BuildResult> => {
    throw notImplemented("buildProject");
  }
);
