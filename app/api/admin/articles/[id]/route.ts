import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { ApiError } from "@/lib/api";
import { deleteArticle, updateArticle } from "@/lib/articles";

type Params = { params: Promise<{ id: string }> };

function fail(err: unknown) {
  if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
  return NextResponse.json({ message: "Could not reach the API" }, { status: 502 });
}

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const article = await updateArticle(id, await request.json());
    revalidatePath("/articles", "layout");
    return NextResponse.json(article);
  } catch (err) {
    return fail(err);
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const article = await updateArticle(id, await request.json(), true);
    revalidatePath("/articles", "layout");
    return NextResponse.json(article);
  } catch (err) {
    return fail(err);
  }
}

export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    await deleteArticle(id);
    revalidatePath("/articles", "layout");
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    return fail(err);
  }
}
