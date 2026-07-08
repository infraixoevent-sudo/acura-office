import { NextRequest, NextResponse } from "next/server";
import { legacyEndpoints, type LegacyEndpoint, type LegacyService } from "@/lib/endpoints";

const envVarNameByService: Record<LegacyService, string> = {
  user: "NEXT_PUBLIC_ACURA_USERS_API_URL",
  events: "NEXT_PUBLIC_ACURA_EVENTS_API_URL",
  admin: "NEXT_PUBLIC_ACURA_ADMIN_API_URL",
};

const fallbackUrlByService: Record<LegacyService, string> = {
  user: "https://acura-user.vantis.team",
  events: "https://acura-events.vantis.team",
  admin: "https://acura-admin.vantis.team",
};

function getBaseUrl(endpoint: LegacyEndpoint) {
  const service = legacyEndpoints[endpoint];
  const value = process.env[envVarNameByService[service]];

  return (value || fallbackUrlByService[service]).replace(/\/$/, "");
}

export async function proxyLegacyEndpoint(
  request: NextRequest,
  endpoint: LegacyEndpoint
) {
  try {
    const body =
      request.method === "GET"
        ? undefined
        : await request.json().catch(() => undefined);

    const authorization = request.headers.get("authorization");

    const response = await fetch(`${getBaseUrl(endpoint)}/${endpoint}`, {
      method: request.method === "GET" ? "GET" : "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") || "";

    const data = contentType.includes("application/json")
      ? await response.json()
      : await response.text();

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      {
        code: false,
        message: "Legacy service request failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}