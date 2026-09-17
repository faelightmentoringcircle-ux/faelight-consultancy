// Client-side image compression → a small data: URL safe to store in a record.
// Downscales to `max` px on the longest edge. JPEG by default (photos); pass
// "png" for logos so transparency is preserved. Falls back to the raw file if
// anything goes wrong (e.g. an unsupported type), so an upload never throws.
export async function compressImage(
  file: File,
  max = 800,
  format: "jpeg" | "png" = "jpeg",
): Promise<string> {
  const raw = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error("read failed"));
    r.readAsDataURL(file);
  });
  try {
    const img = document.createElement("img");
    await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = raw; });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale), h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return raw;
    ctx.drawImage(img, 0, 0, w, h);
    return format === "png" ? canvas.toDataURL("image/png") : canvas.toDataURL("image/jpeg", 0.8);
  } catch {
    return raw;
  }
}
