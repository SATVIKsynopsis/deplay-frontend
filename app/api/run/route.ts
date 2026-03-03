import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const backendRes = await fetch(
    "http://3.111.147.73:8080/logs/run",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const text = await backendRes.text();

  try {
    const json = JSON.parse(text);
    return NextResponse.json(json, { status: backendRes.status });
  } catch {
    // backend returned non-JSON (plain error)
    return NextResponse.json(
      { error: text || "Backend error" },
      { status: backendRes.status }
    );
  }
}