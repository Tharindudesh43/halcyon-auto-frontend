import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api";
import { createCareer } from "@/lib/careers";

export async function POST(request: NextRequest) {
  const input = await request.json();
  try {
    return NextResponse.json(await createCareer(input), { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ message: "Could not reach the API" }, { status: 502 });
  }
}
