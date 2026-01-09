export const normalizeProjectName = (name: string, fallback = "Untitled Project") => {
  const trimmed = name.trim().replace(/\s+/g, " ");
  return trimmed.length > 0 ? trimmed : fallback;
};
