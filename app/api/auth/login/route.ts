import { NextRequest, NextResponse } from "next/server";
import { apiFetch, ApiError, clientIp } from "@/lib/api";
import { setSessionToken } from "@/lib/session";

type LoginResponse = {
  user: { id: number; name: string; email: string };
  token: string;
};

export async function POST(request: NextRequest) {
  const { email, password } = await request.json();

  try {
    const data = await apiFetch<LoginResponse>("/login", {
      method: "POST",
      body: { email, password },
      ip: clientIp(request),
    });

    await setSessionToken(data.token);

    return NextResponse.json({ user: data.user });
  } catch (err) {
    if (err instanceof ApiError) {
      if (err.status === 429) {
        return NextResponse.json({ message: "Too many attempts. Please wait a minute and try again." }, { status: 429 });
      }
      return NextResponse.json(
        { message: "Invalid email or password" },
        { status: err.status === 422 ? 401 : err.status }
      );
    }
    return NextResponse.json({ message: "Could not reach the API" }, { status: 502 });
  }
}
