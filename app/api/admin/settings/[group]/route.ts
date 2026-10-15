import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api";
import { updateSettings } from "@/lib/settings";
import { SETTINGS_GROUPS, type SettingsGroup } from "@/lib/settings-types";

type Params = { params: Promise<{ group: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { group } = await params;

  if (!SETTINGS_GROUPS.includes(group as SettingsGroup)) {
    return NextResponse.json({ message: "Unknown settings group" }, { status: 404 });
  }

  const input = await request.json().catch(() => null);
  if (!input || typeof input !== "object") {
    return NextResponse.json({ message: "Invalid request" }, { status: 400 });
  }

  try {
    const saved = await updateSettings(group as SettingsGroup, input);
    revalidatePath("/", "layout");
    return NextResponse.json(saved);
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ message: "Could not reach the API" }, { status: 502 });
  }
}
