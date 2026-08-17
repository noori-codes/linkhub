export type CropViewport = {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  displayWidth: number;
  displayHeight: number;
};

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Could not load image")));
    image.src = src;
  });
}

/** Map on-screen crop viewport to a JPEG blob. */
export async function cropImageToJpeg(
  imageSrc: string,
  viewport: CropViewport,
  quality = 0.92,
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const scaleX = image.naturalWidth / viewport.displayWidth;
  const scaleY = image.naturalHeight / viewport.displayHeight;

  const sx = Math.max(0, -viewport.offsetX * scaleX);
  const sy = Math.max(0, -viewport.offsetY * scaleY);
  const sw = Math.min(image.naturalWidth - sx, viewport.width * scaleX);
  const sh = Math.min(image.naturalHeight - sy, viewport.height * scaleY);

  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(sw));
  canvas.height = Math.max(1, Math.round(sh));

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas not supported");
  }

  ctx.drawImage(image, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not export crop"))),
      "image/jpeg",
      quality,
    );
  });
}

/** Scale image so it fully covers the viewport at zoom 1. */
export function coverScale(
  imageWidth: number,
  imageHeight: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  if (!imageWidth || !imageHeight) return 1;
  return Math.max(viewportWidth / imageWidth, viewportHeight / imageHeight);
}

export function clampImageOffset(
  offsetX: number,
  offsetY: number,
  displayWidth: number,
  displayHeight: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  const minX = viewportWidth - displayWidth;
  const minY = viewportHeight - displayHeight;

  return {
    x: Math.min(0, Math.max(minX, offsetX)),
    y: Math.min(0, Math.max(minY, offsetY)),
  };
}

export function centeredOffset(
  displayWidth: number,
  displayHeight: number,
  viewportWidth: number,
  viewportHeight: number,
) {
  return clampImageOffset(
    (viewportWidth - displayWidth) / 2,
    (viewportHeight - displayHeight) / 2,
    displayWidth,
    displayHeight,
    viewportWidth,
    viewportHeight,
  );
}
