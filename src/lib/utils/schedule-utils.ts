export function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[’]/g, "'")
    .replace(/\s+/g, " ");
}

export function normalizeRiderName(value: string | null | undefined): string {
  return normalizeText(value).replace(/\s+,/g, ",");
}

export function makeHorseRiderKey(riderName: string, horseName: string): string {
  return `${normalizeRiderName(riderName)}|${normalizeText(horseName)}`;
}

export function parseRiderName(riderName: string): {
  firstName?: string;
  lastName?: string;
} {
  const [lastName, firstName] = riderName.split(",").map((part) => part.trim());

  return {
    firstName,
    lastName,
  };
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDay(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
  });
}

export function formatDateLabel(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function createStableId(
  parts: Array<string | number | null | undefined>
): string {
  return parts
    .map((part) => normalizeText(String(part ?? "")))
    .join("__")
    .replace(/[^a-z0-9_]+/g, "-");
}