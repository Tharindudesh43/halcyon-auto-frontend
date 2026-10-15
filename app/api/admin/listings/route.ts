import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api";
import { createCar } from "@/lib/cars";

export async function POST(request: NextRequest) {
  const input = await request.json();

  try {
    const car = await createCar(input);
    return NextResponse.json(car, { status: 201 });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(err.body, { status: err.status });
    }
    return NextResponse.json({ message: "Could not reach the API" }, { status: 502 });
  }
}
