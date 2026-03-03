import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) {
        return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const res = await fetch("http://3.111.147.73:8080/me", {
        headers: {
            "Cookie": `session=${session}`,
        },
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
}