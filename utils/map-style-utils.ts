import { renderToStaticMarkup } from "react-dom/server";
import { ReactElement } from "react";

type ImageMap = {
  hasImage: (id: string) => boolean;
  addImage: (
    id: string,
    image: ImageData,
    options?: { pixelRatio?: number },
  ) => void;
};

// Helper to load an image from a URL (or data URL)
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
};

/**
 * Generate a teardrop-shaped pin image (matching CustomPinMarker design)
 * with an icon inside, and add it to the Mapbox map.
 */
export async function generatePinImage(
  map: ImageMap,
  id: string,
  color: string,
  icon: string | ReactElement,
  scale: number = 1.0,
) {
  if (map.hasImage(id)) return;

  const pad = 3; // padding to prevent stroke clipping
  const svgW = 42 + pad * 2; // original 42 + padding both sides
  const svgH = 54 + pad * 2; // original 54 + padding top/bottom
  const pixelRatio = 2; // retina
  const width = Math.round(svgW * scale * pixelRatio);
  const height = Math.round(svgH * scale * pixelRatio);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.scale(pixelRatio * scale, pixelRatio * scale);

  // -- Draw the teardrop pin shape with padding to avoid stroke clipping --
  const pinSvg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${svgW}" height="${svgH}" viewBox="${-pad} ${-pad} ${svgW} ${svgH}" fill="none">
      <path
        d="M21 0.5C32.3218 0.5 41.5 9.67816 41.5 21C41.5 29.8248 35.9236 37.3487 28.1006 40.2373C26.1184 40.9692 24.2112 42.1206 22.9561 43.918L21.2422 46.3711V46.3721C21.2143 46.4122 21.1768 46.4447 21.1348 46.4668C21.0928 46.4887 21.0466 46.5 21 46.5C20.9534 46.5 20.9072 46.4887 20.8652 46.4668C20.8232 46.4447 20.7857 46.4122 20.7578 46.3721V46.3711L19.0439 43.918C17.7888 42.1206 15.8816 40.9692 13.8994 40.2373C6.07643 37.3487 0.5 29.8248 0.5 21C0.5 9.67816 9.67816 0.5 21 0.5Z"
        fill="${color}"
        stroke="white"
        stroke-width="2.5"
      />
      <circle cx="21" cy="52" r="2" fill="white"/>
    </svg>
  `;

  // Draw pin shape
  const pinBlob = new Blob([pinSvg], { type: "image/svg+xml" });
  const pinUrl = URL.createObjectURL(pinBlob);

  try {
    const pinImg = await loadImage(pinUrl);
    ctx.drawImage(pinImg, 0, 0, svgW, svgH);

    // Draw icon centered in the circle area (circle center at 21,21 in original coords, offset by padding)
    // If icon is a ReactElement, convert it to SVG string
    const iconStr =
      typeof icon === "string" ? icon : renderToStaticMarkup(icon);

    const iconImg = await loadImage(
      URL.createObjectURL(new Blob([iconStr], { type: "image/svg+xml" })),
    );
    const iconSize = 26; // Increased from 20 to be "almost full" (circle dia is ~42)
    const iconX = pad + (42 - iconSize) / 2; // centered horizontally (with padding offset)
    const iconY = pad + 21 - iconSize / 2; // centered on circle's visual center + padding
    ctx.drawImage(iconImg, iconX, iconY, iconSize, iconSize);

    // Add to map
    const imageData = ctx.getImageData(0, 0, width, height);
    map.addImage(id, imageData, { pixelRatio });
  } catch (e) {
    console.error("Failed to load icon for pin", id, e);
  } finally {
    URL.revokeObjectURL(pinUrl);
  }
}

// SVG Strings for Lucide Icons
export const ICONS = {
  // Device icons (main pins)
  droplet: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a7 7 0 0 0 7-7c0-2-2-3-2-3-1.5-2-5-10-5-10S7 10 5.5 12a7 7 0 0 0 6.5 10z"/></svg>`,
  flame: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.1.2-2.2.6-3.3.7 2.5 3.1 4.1 4.4 4.1z"/></svg>`,
  video: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect width="14" height="12" x="2" y="6" rx="2" ry="2"/></svg>`,
  home: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  waves: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg>`,
  cylinder: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5"/></svg>`,

  // Info category icons (smaller pins)
  building: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`,
  package: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>`,
  mapPin: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>`,
  tree: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10v.2A3 3 0 0 1 8.9 16v0H5v0h0a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M10.5 19H13a1 1 0 0 0 1-1v-.2a3 3 0 0 1 1.1-5.8V10a3 3 0 0 1 6 0v.2a3 3 0 0 1-1 5.8h-.9a1 1 0 0 0-1 1v3"/></svg>`,
  alert: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>`,
  shoppingBag: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  barChart: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>`,
  cpu: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2"/><path d="M15 20v2"/><path d="M2 15h2"/><path d="M2 9h2"/><path d="M20 15h2"/><path d="M20 9h2"/><path d="M9 2v2"/><path d="M9 20v2"/></svg>`,
  info: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>`,
  sun: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>`,
};
