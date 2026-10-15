import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api";
import { deleteEnquiry, setEnquiryHandled } from "@/lib/enquiries";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const { handled } = await request.json();

  try {
    return NextResponse.json(await setEnquiryHandled(id, Boolean(handled)));
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ message: "Could not reach the API" }, { status: 502 });
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    return NextResponse.json(await deleteEnquiry(id));
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ message: "Could not reach the API" }, { status: 502 });
  }
}
