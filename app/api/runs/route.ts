import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = req.cookies.get("session")?.value;
    
    console.log("Session cookie:", sessionCookie ? "exists" : "missing");
    console.log("All cookies:", req.cookies.getAll());
    
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (sessionCookie) {
      headers["Cookie"] = `session=${sessionCookie}`;
    }

    const backendUrl = "https://7hhu2l3cw4.execute-api.ap-south-1.amazonaws.com/runs";
    console.log("Fetching from:", backendUrl);
    
    const backendRes = await fetch(backendUrl, {
      method: "GET",
      headers,
      credentials: "include",
    });

    console.log("Backend response status:", backendRes.status);
    
    const text = await backendRes.text();
    console.log("Backend response text length:", text.length);
    console.log("Backend response text:", text.substring(0, 200));

    if (!backendRes.ok) {
      console.error("Backend error response:", text);
      return NextResponse.json(
        { error: `Backend returned ${backendRes.status}: ${text}` },
        { status: backendRes.status }
      );
    }

    try {
      const json = JSON.parse(text);
      console.log("Parsed JSON:", json);
      return NextResponse.json(json, { status: 200 });
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Raw response:", text);
      return NextResponse.json(
        { error: "Invalid JSON response from backend", raw: text },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: `Server error: ${error instanceof Error ? error.message : "Unknown error"}` },
      { status: 500 }
    );
  }
}
