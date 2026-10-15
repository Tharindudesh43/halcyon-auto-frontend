import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api";
import { createArticle } from "@/lib/articles";

export async function POST(request: NextRequest) {
  try {
    const article = await createArticle(await request.json());
    revalidatePath("/articles");
    return NextResponse.json(article, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ message: "Could not reach the API" }, { status: 502 });
  }
}
