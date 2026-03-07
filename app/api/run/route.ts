import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value; // ✅ read session

  const body = await req.json();

  const backendRes = await fetch("https://7hhu2l3cw4.execute-api.ap-south-1.amazonaws.com/run", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(session ? { "Cookie": `session=${session}` } : {}), 
    },
    body: JSON.stringify(body),
  });

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
}