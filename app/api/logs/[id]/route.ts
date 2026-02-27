import { NextRequest } from "next/server";

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;

  const backendUrl = `http://3.111.147.73:8080/logs/${id}`;

  const backendRes = await fetch(backendUrl, {
    headers: {
      Accept: "text/event-stream",
    },
  });

  if (!backendRes.body) {
    return new Response("No log stream", { status: 500 });
  }

  return new Response(backendRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}