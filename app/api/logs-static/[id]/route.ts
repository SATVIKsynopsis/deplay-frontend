import { NextRequest, NextResponse } from "next/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const res = await fetch(`https://7hhu2l3cw4.execute-api.ap-south-1.amazonaws.com/logs-static/${id}`);
    
    if (!res.ok) {
        return NextResponse.json({ error: "Logs not found" }, { status: 404 });
    }

    const text = await res.text();
    return new Response(text, {
        headers: { "Content-Type": "text/plain" },
    });
}