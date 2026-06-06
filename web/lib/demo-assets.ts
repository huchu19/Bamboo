import assets from "./demo-assets.json";

type Kind = "video" | "poster";

export function getDemoAsset(slug: string, kind: Kind): string {
  const url = (assets as Record<string, Record<string, string>>)[slug]?.[kind];
  if (url) return url;
  return `/demo/${slug}/${kind === "video" ? "pitch.mp4" : "poster.jpg"}`;
}
