import { NextRequest, NextResponse } from "next/server";
import { getSessionToken } from "@/lib/session";

const LARAVEL_API_URL = process.env.LARAVEL_API_URL ?? "http://localhost:8000";

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  const incoming = await request.formData();
  const file = incoming.get("file");

  if (!file || !(file instanceof Blob)) {
    return NextResponse.json({ message: "No file provided" }, { status: 400 });
  }

  const outgoing = new FormData();
  outgoing.append("file", file, (file as File).name ?? "upload.jpg");

  const res = await fetch(`${LARAVEL_API_URL}/api/uploads`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: outgoing,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    return NextResponse.json(data ?? { message: "Upload failed" }, { status: res.status });
  }

  return NextResponse.json(data);
}

export async function DELETE(request: NextRequest) {
  const token = await getSessionToken();
  const { public_id } = await request.json();

  const res = await fetch(`${LARAVEL_API_URL}/api/uploads`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ public_id }),
  });

  const data = await res.json().catch(() => null);
  return NextResponse.json(data, { status: res.status });
}
