import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api";
import { createFaq } from "@/lib/faqs";

export async function POST(request: NextRequest) {
  try {
    const faq = await createFaq(await request.json());
    revalidatePath("/faq");
    return NextResponse.json(faq, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ message: "Could not reach the API" }, { status: 502 });
  }
}
