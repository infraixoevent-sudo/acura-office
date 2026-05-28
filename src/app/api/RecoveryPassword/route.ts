import { NextRequest } from "next/server";
import { proxyLegacyEndpoint } from "@/lib/legacyProxy";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return proxyLegacyEndpoint(request, "RecoveryPassword");
}

export async function GET(request: NextRequest) {
  return proxyLegacyEndpoint(request, "RecoveryPassword");
}
