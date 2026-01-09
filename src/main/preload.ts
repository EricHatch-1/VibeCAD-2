import { contextBridge, ipcRenderer } from "electron";
import type {
  BuildRequest,
  BuildResult,
  CommitVersionRequest,
  CommitVersionResult,
  CreateProjectRequest,
  CreateProjectResult,
  FileNode,
  OpenProjectRequest,
  ProjectListItem,
  RunOpenScadRequest,
  SelectionContext,
  VersionCheckoutRequest
} from "../shared/ipc";
import { IpcChannel } from "../shared/ipc";

const api = {
  listProjects: () => ipcRenderer.invoke(IpcChannel.ListProjects) as Promise<ProjectListItem[]>,
  createProject: (payload: CreateProjectRequest) =>
    ipcRenderer.invoke(IpcChannel.CreateProject, payload) as Promise<CreateProjectResult>,
  openProject: (payload: OpenProjectRequest) =>
    ipcRenderer.invoke(IpcChannel.OpenProject, payload) as Promise<void>,
  listFiles: (projectId: string, root = "src/") =>
    ipcRenderer.invoke(IpcChannel.ListFiles, { projectId, root }) as Promise<FileNode[]>,
  readFile: (projectId: string, path: string) =>
    ipcRenderer.invoke(IpcChannel.ReadFile, { projectId, path }) as Promise<string>,
  writeFile: (projectId: string, path: string, text: string) =>
    ipcRenderer.invoke(IpcChannel.WriteFile, { projectId, path, text }) as Promise<void>,
  runOpenScad: (payload: RunOpenScadRequest) =>
    ipcRenderer.invoke(IpcChannel.RunOpenScad, payload) as Promise<BuildResult>,
  commitVersion: (payload: CommitVersionRequest) =>
    ipcRenderer.invoke(IpcChannel.CommitVersion, payload) as Promise<CommitVersionResult>,
  checkoutVersion: (payload: VersionCheckoutRequest) =>
    ipcRenderer.invoke(IpcChannel.CheckoutVersion, payload) as Promise<void>,
  getSelectionContext: () =>
    ipcRenderer.invoke(IpcChannel.GetSelectionContext) as Promise<SelectionContext | null>,
  saveSelectionSnapshot: () =>
    ipcRenderer.invoke(IpcChannel.SaveSelectionSnapshot) as Promise<string | null>,
  buildProject: (payload: BuildRequest) =>
    ipcRenderer.invoke(IpcChannel.BuildProject, payload) as Promise<BuildResult>
};

contextBridge.exposeInMainWorld("vibeCad", api);

export type VibeCadApi = typeof api;
