import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api";
import { deleteCar, updateCar, updateCarDiscount, updateCarStatus } from "@/lib/cars";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const input = await request.json();

  try {
    const car = await updateCar(id, input);
    return NextResponse.json(car);
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ message: "Could not reach the API" }, { status: 502 });
  }
}

export async function PATCH(request: NextRequest, { params }: Params) {
  const { id } = await params;
  const body = await request.json();

  try {
    const car =
      "discount_percent" in body
        ? await updateCarDiscount(id, body.discount_percent)
        : await updateCarStatus(id, body.status);
    return NextResponse.json(car);
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ message: "Could not reach the API" }, { status: 502 });
  }
}

export async function DELETE(request: NextRequest, { params }: Params) {
  const { id } = await params;

  try {
    await deleteCar(id);
    return NextResponse.json({ message: "Deleted" });
  } catch (err) {
    if (err instanceof ApiError) return NextResponse.json(err.body, { status: err.status });
    return NextResponse.json({ message: "Could not reach the API" }, { status: 502 });
  }
}
