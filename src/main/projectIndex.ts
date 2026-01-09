import Database from "better-sqlite3";
import path from "node:path";
import { ensureAppPaths, getProjectLibraryPath, getProjectsRoot } from "./projectPaths";
import type { ProjectListItem } from "../shared/ipc";

const createSchema = (db: Database.Database) => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      project_id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      path TEXT NOT NULL,
      entrypoint TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      last_opened_at TEXT,
      thumbnail_path TEXT,
      deleted_at TEXT
    );
  `);
};

export type ProjectIndex = {
  listProjects: () => ProjectListItem[];
  getProject: (projectId: string) => ProjectListItem | null;
  createProject: (payload: {
    project_id: string;
    name: string;
    entrypoint: string;
    created_at: string;
  }) => ProjectListItem;
  touchProject: (projectId: string, updatedAt: string) => void;
  markOpened: (projectId: string, openedAt: string) => void;
};

let cachedIndex: ProjectIndex | null = null;

export const getProjectIndex = (): ProjectIndex => {
  if (cachedIndex) {
    return cachedIndex;
  }

  ensureAppPaths();
  const dbPath = getProjectLibraryPath();
  const db = new Database(dbPath);
  createSchema(db);

  const listStmt = db.prepare(`
    SELECT project_id, name, path, entrypoint, created_at, updated_at,
           last_opened_at, thumbnail_path, deleted_at
    FROM projects
    WHERE deleted_at IS NULL
    ORDER BY updated_at DESC
  `);

  const getStmt = db.prepare(
    `SELECT project_id, name, path, entrypoint, created_at, updated_at,
            last_opened_at, thumbnail_path, deleted_at
     FROM projects
     WHERE project_id = ?`
  );

  const insertStmt = db.prepare(`
    INSERT INTO projects (
      project_id, name, path, entrypoint, created_at, updated_at,
      last_opened_at, thumbnail_path, deleted_at
    ) VALUES (?, ?, ?, ?, ?, ?, NULL, NULL, NULL)
  `);

  const touchStmt = db.prepare(`
    UPDATE projects
    SET updated_at = ?
    WHERE project_id = ?
  `);

  const openStmt = db.prepare(`
    UPDATE projects
    SET last_opened_at = ?, updated_at = ?
    WHERE project_id = ?
  `);

  cachedIndex = {
    listProjects: () => listStmt.all() as ProjectListItem[],
    getProject: (projectId: string) => (getStmt.get(projectId) as ProjectListItem) ?? null,
    createProject: ({ project_id, name, entrypoint, created_at }) => {
      const projectPath = path.join(getProjectsRoot(), project_id);
      insertStmt.run(project_id, name, projectPath, entrypoint, created_at, created_at);
      return {
        project_id,
        name,
        path: projectPath,
        entrypoint,
        created_at,
        updated_at: created_at,
        last_opened_at: null,
        thumbnail_path: null,
        deleted_at: null
      };
    },
    touchProject: (projectId: string, updatedAt: string) => {
      touchStmt.run(updatedAt, projectId);
    },
    markOpened: (projectId: string, openedAt: string) => {
      openStmt.run(openedAt, openedAt, projectId);
    }
  };

  return cachedIndex;
};
