export function getShowConnectIdFromUrl(url: string): string | null {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.searchParams.get("ShowConnectId");
  } catch {
    return null;
  }
}