import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const backendRes = await fetch(
    `https://7hhu2l3cw4.execute-api.ap-south-1.amazonaws.com/analysis/${id}`,
    {
      cache: "no-store",
    }
  );

  if (!backendRes.ok) {
    return new Response("Analysis not ready", {
      status: backendRes.status,
    });
  }

  return new Response(await backendRes.text(), {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}