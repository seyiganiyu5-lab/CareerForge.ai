// Minimal production server that serves Next.js prerendered pages and static assets
// Uses bun's built-in HTTP server - very low memory footprint

import { readdirSync, existsSync, statSync } from "fs";
import { join, extname } from "path";

const PORT = 3000;
const NEXT_DIR = join(process.cwd(), ".next");
const STATIC_DIR = join(NEXT_DIR, "static");
const SERVER_DIR = join(NEXT_DIR, "server");

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".map": "application/json",
  ".txt": "text/plain",
};

function getMimeType(path: string): string {
  return MIME_TYPES[extname(path)] || "application/octet-stream";
}

function serveStatic(filePath: string): Response | null {
  if (!existsSync(filePath) || !statSync(filePath).isFile()) {
    return null;
  }
  const content = Bun.file(filePath);
  return new Response(content, {
    headers: {
      "Content-Type": getMimeType(filePath),
      "Cache-Control": filePath.includes("static") ? "public, max-age=31536000, immutable" : "public, max-age=0, must-revalidate",
    },
  });
}

const server = Bun.serve({
  port: PORT,
  hostname: "0.0.0.0",
  development: false,

  async fetch(req) {
    const url = new URL(req.url);
    let pathname = url.pathname;

    // Remove trailing slash (except for root)
    if (pathname !== "/" && pathname.endsWith("/")) {
      pathname = pathname.slice(0, -1);
    }

    // 1. Serve _next/static assets (URL /_next/static/* → filesystem .next/static/*)
    if (pathname.startsWith("/_next/static/")) {
      // Strip /_next prefix: /_next/static/chunks/X.css → static/chunks/X.css
      const relativePath = pathname.replace(/^\/_next\//, "");
      const filePath = join(NEXT_DIR, relativePath);
      return serveStatic(filePath) || new Response("Not Found", { status: 404 });
    }

    // 2. Serve _next media (fonts etc)
    if (pathname.startsWith("/_next/media/")) {
      const relativePath = pathname.replace(/^\/_next\//, "");
      const filePath = join(NEXT_DIR, relativePath);
      return serveStatic(filePath) || new Response("Not Found", { status: 404 });
    }

    // 3. Serve other _next routes (webpack chunks, etc)
    if (pathname.startsWith("/_next/")) {
      const relativePath = pathname.replace(/^\/_next\//, "");
      const filePath = join(NEXT_DIR, relativePath);
      return serveStatic(filePath) || new Response("Not Found", { status: 404 });
    }

    // 4. Serve _next/image endpoint - not supported
    if (pathname.startsWith("/_next/image")) {
      return new Response("Not Found", { status: 404 });
    }

    // 3. Try prerendered HTML from server/app/
    // Map / → index.html, /path → path.html
    const htmlName = pathname === "/" ? "index.html" : `${pathname}.html`;
    const filePath = join(SERVER_DIR, "app", htmlName);
    const html = serveStatic(filePath);
    if (html) {
      return html;
    }

    // 4. Try RSC data (for client-side navigation)
    const rscName = pathname === "/" ? "index.rsc" : `${pathname}.rsc`;
    const rscPath = join(SERVER_DIR, "app", rscName);
    const rsc = serveStatic(rscPath);
    if (rsc) {
      return rsc;
    }

    // 5. Fallback to 404
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`✓ Static server running on http://localhost:${PORT}`);
