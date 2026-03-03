import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
    const cookieStore = await cookies();
    const ghToken = cookieStore.get("gh_token")?.value;

    if (!ghToken) {
        return NextResponse.json({ error: "Not logged in" }, { status: 401 });
    }

    const res = await fetch("https://api.github.com/user", {
        headers: {
            "Authorization": `Bearer ${ghToken}`,
            "User-Agent": "deplik-app",
        },
    });

    const data = await res.json();
    return NextResponse.json(data);
}