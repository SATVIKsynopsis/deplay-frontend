import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const cookies = req.headers.get("cookie") || "";
    
    const backendRes = await fetch(
      "http://3.111.147.73:8080/runs",
      {
        method: "GET",
        headers: {
          "Cookie": cookies,
          "Content-Type": "application/json",
        },
      }
    );

    const text = await backendRes.text();

    try {
      const json = JSON.parse(text);
      return NextResponse.json(json, { status: backendRes.status });
    } catch {
      return NextResponse.json(
        { error: text || "Backend error" },
        { status: backendRes.status }
      );
    }
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: "Failed to fetch runs" },
      { status: 500 }
    );
  }
}
