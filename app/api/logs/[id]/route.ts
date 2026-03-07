import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const backendRes = await fetch(
    `http://3.111.147.73:8080/logs/${id}`,
    {
      headers: {
        Accept: "text/event-stream",
      },
      cache: "no-store",
    }
  );  

  return new Response(backendRes.body, {
    status: backendRes.status,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}