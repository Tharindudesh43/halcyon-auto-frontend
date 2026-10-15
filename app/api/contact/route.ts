import { NextRequest, NextResponse } from "next/server";
import { apiFetch, ApiError, clientIp } from "@/lib/api";

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const data = await apiFetch<{ message: string }>("/contact", { method: "POST", body, ip: clientIp(request) });
    return NextResponse.json(data);
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ message: "Could not reach the API" }, { status: 502 });
  }
}
