import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api";
import { reorderFaqs } from "@/lib/faqs";

export async function POST(request: NextRequest) {
  const { ids } = await request.json();
  try {
    await reorderFaqs(ids);
    revalidatePath("/faq");
    return NextResponse.json({ message: "Reordered" });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ message: "Could not reach the API" }, { status: 502 });
  }
}
