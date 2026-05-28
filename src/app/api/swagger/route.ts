import { NextResponse } from "next/server";
import { openApiDocument } from "@/app/swagger/openapi";

export async function GET() {
  return NextResponse.json(openApiDocument);
}
