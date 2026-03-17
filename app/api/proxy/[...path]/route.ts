import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = (await params).path;
  return handleProxy(request, path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = (await params).path;
  return handleProxy(request, path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = (await params).path;
  return handleProxy(request, path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> },
) {
  const path = (await params).path;
  return handleProxy(request, path);
}

async function handleProxy(request: NextRequest, path: string[]) {
  const backendUrl = process.env.GOV_API_URL || "http://localhost:4000";
  const targetPath = path.join("/");
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${backendUrl}/${targetPath}${searchParams ? `?${searchParams}` : ""}`;

  const headers = new Headers(request.headers);
  headers.delete("host");

  try {
    const bodyText =
      request.method !== "GET" && request.method !== "HEAD"
        ? await request.text()
        : undefined;

    const response = await fetch(url, {
      method: request.method,
      headers,
      body: bodyText,
      duplex: "half",
    } as any);

    const responseData = await response.blob();

    return new NextResponse(responseData, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error: any) {
    console.error(`Proxy Error [${request.method} ${url}]:`, error);
    return NextResponse.json(
      { success: false, message: "Proxy error", error: error.message },
      { status: 502 },
    );
  }
}
