export type VersionParts = {
  major: number;
  minor: number;
};

export const parseVersionId = (versionId: string): VersionParts | null => {
  if (!versionId.startsWith("v")) {
    return null;
  }
  const raw = versionId.slice(1);
  const [majorPart, minorPart] = raw.split(".");
  const major = Number(majorPart);
  const minor = minorPart === undefined ? 0 : Number(minorPart);
  if (!Number.isInteger(major) || !Number.isInteger(minor) || major < 1 || minor < 0) {
    return null;
  }
  return { major, minor };
};

export const formatVersionId = (parts: VersionParts) => {
  if (parts.minor === 0) {
    return `v${parts.major}`;
  }
  return `v${parts.major}.${parts.minor}`;
};

export const bumpVersion = (current: VersionParts | null, bump: "major" | "minor") => {
  if (!current) {
    return { major: 1, minor: 0 };
  }
  if (bump === "major") {
    return { major: current.major + 1, minor: 0 };
  }
  return { major: current.major, minor: current.minor + 1 };
};
