"use server";

export async function fetchMetadata(url: string) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; StudyArchive/1.0)" },
    });
    clearTimeout(timeout);

    if (!response.ok) return null;
    const html = await response.text();

    const get = (pattern: RegExp) => html.match(pattern)?.[1] || "";

    return {
      title:
        get(/property="og:title"\s+content="([^"]+)"/) ||
        get(/name="title"\s+content="([^"]+)"/) ||
        get(/<title>([^<]+)<\/title>/i) ||
        url,
      description:
        get(/property="og:description"\s+content="([^"]+)"/) ||
        get(/name="description"\s+content="([^"]+)"/),
      image:
        get(/property="og:image"\s+content="([^"]+)"/) || "",
    };
  } catch {
    return null;
  }
}
