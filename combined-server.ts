// Lightweight production server that serves both static pages AND API routes
// Uses Bun's built-in HTTP server - very low memory footprint

import { readdirSync, existsSync, statSync, readFileSync } from "fs";
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
      "Cache-Control": filePath.includes("static")
        ? "public, max-age=31536000, immutable"
        : "public, max-age=0, must-revalidate",
    },
  });
}

// ─── API Route Handler ────────────────────────────────────────
async function handleApiRoute(url: URL, req: Request): Promise<Response> {
  const pathname = url.pathname;

  // Map pathname to the built API route file
  const routePath = pathname.startsWith("/api/") ? pathname : null;
  if (!routePath) {
    return new Response("Not Found", { status: 404 });
  }

  // Find the route.js file in the build output
  const routeFile = join(SERVER_DIR, "app", routePath, "route.js");
  if (!existsSync(routeFile)) {
    return Response.json(
      { success: false, error: "API route not found" },
      { status: 404 }
    );
  }

  try {
    // Dynamically import the route handler
    // Route handlers export GET, POST, PUT, DELETE, PATCH, etc.
    const mod = require(routeFile);

    // Next.js API routes export named HTTP method handlers
    const method = req.method.toUpperCase();
    const handler = mod[method] || mod.GET;

    if (!handler || typeof handler !== "function") {
      return Response.json(
        { success: false, error: `Method ${method} not allowed` },
        { status: 405 }
      );
    }

    // Build a minimal Next.js-like request context
    const body = method !== "GET" && method !== "HEAD"
      ? await req.text()
      : undefined;

    const cookies = req.headers.get("cookie") || "";
    const cookieObj: Record<string, string> = {};
    cookies.split(";").forEach((c) => {
      const [key, ...val] = c.trim().split("=");
      if (key) cookieObj[key.trim()] = val.join("=").trim();
    });

    // Build NextRequest-like and NextResponse-like context
    const mockRequest = {
      method: req.method,
      headers: Object.fromEntries(req.headers.entries()),
      body: body,
      cookies: cookieObj,
      url: req.url,
      json: async () => JSON.parse(body || "{}"),
      nextUrl: { pathname: url.pathname, searchParams: url.searchParams },
    };

    // Wrap handler in async IIFE to provide 'this' context
    const boundHandler = handler;
    let result = await boundHandler(mockRequest);

    // Handle various return types
    if (result instanceof Response) {
      return result;
    }

    // Next.js Response.json() or NextResponse
    if (result && typeof result === "object") {
      const status = result.status || 200;
      const headers = result.headers || {};
      const body = result.body || JSON.stringify({
        success: false,
        error: "Unknown response format"
      });

      return new Response(typeof body === "string" ? body : JSON.stringify(body), {
        status,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          ...headers,
        },
      });
    }

    return new Response(String(result), {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (error) {
    console.error(`[API Error] ${routePath}:`, error.message);
    return Response.json(
      { success: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
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

    // 1. API Routes — handle with dynamic import
    if (pathname.startsWith("/api/")) {
      return handleApiRoute(url, req);
    }

    // 2. Serve _next/static assets
    if (pathname.startsWith("/_next/static/")) {
      const relativePath = pathname.replace(/^\/_next\//, "");
      const filePath = join(NEXT_DIR, relativePath);
      return serveStatic(filePath) || new Response("Not Found", { status: 404 });
    }

    // 3. Serve _next media
    if (pathname.startsWith("/_next/media/")) {
      const relativePath = pathname.replace(/^\/_next\//, "");
      const filePath = join(NEXT_DIR, relativePath);
      return serveStatic(filePath) || new Response("Not Found", { status: 404 });
    }

    // 4. Other _next routes
    if (pathname.startsWith("/_next/")) {
      const relativePath = pathname.replace(/^\/_next\//, "");
      const filePath = join(NEXT_DIR, relativePath);
      return serveStatic(filePath) || new Response("Not Found", { status: 404 });
    }

    // 5. _next/image endpoint - not supported
    if (pathname.startsWith("/_next/image")) {
      return new Response("Not Found", { status: 404 });
    }

    // 6. Try prerendered HTML
    const htmlName = pathname === "/" ? "index.html" : `${pathname}.html`;
    const filePath = join(SERVER_DIR, "app", htmlName);
    const html = serveStatic(filePath);
    if (html) {
      return html;
    }

    // 7. Try RSC data
    const rscName = pathname === "/" ? "index.rsc" : `${pathname}.rsc`;
    const rscPath = join(SERVER_DIR, "app", rscName);
    const rsc = serveStatic(rscPath);
    if (rsc) {
      return rsc;
    }

    // 8. Fallback to 404
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`✓ Combined server (static + API) running on http://localhost:${PORT}`);
