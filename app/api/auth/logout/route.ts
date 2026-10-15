import { NextResponse } from "next/server";
import { apiFetch } from "@/lib/api";
import { clearSessionToken, getSessionToken } from "@/lib/session";

export async function POST() {
  const token = await getSessionToken();

  if (token) {
    try {
      await apiFetch("/logout", { method: "POST", token });
    } catch {

    }
  }

  await clearSessionToken();

  return NextResponse.json({ message: "Logged out" });
}
