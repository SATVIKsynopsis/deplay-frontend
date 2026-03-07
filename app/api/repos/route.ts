import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
        return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const res = await fetch("https://7hhu2l3cw4.execute-api.ap-south-1.amazonaws.com/repos", {
        headers: {
            "Cookie": `session=${session}`,
        },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}