export function youtubeId(url: string) {
  const m =
    url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/) ||
    url.match(/[?&]v=([A-Za-z0-9_-]{6,})/);
  return m?.[1] || "";
}

export function vimeoId(url: string) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m?.[1] || "";
}

export function homepageVideoKind(url: string): "youtube" | "vimeo" | "file" {
  if (youtubeId(url)) return "youtube";
  if (vimeoId(url)) return "vimeo";
  return "file";
}
