import { NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";

export async function GET() {
  try {
    const swPath = path.join(process.cwd(), "public", "sw.js");
    const content = fs.readFileSync(swPath, "utf8");
    return new NextResponse(content, {
      headers: {
        "Content-Type": "application/javascript; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Service-Worker-Allowed": "/",
      },
    });
  } catch {
    return new NextResponse("/* sw not found */", {
      status: 404,
      headers: { "Content-Type": "application/javascript" },
    });
  }
}
