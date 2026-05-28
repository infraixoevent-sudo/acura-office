import { legacyEndpoints } from "@/lib/endpoints";

const paths = Object.fromEntries(
  Object.keys(legacyEndpoints).sort().map((endpoint) => [
    `/${endpoint}`,
    {
      post: {
        summary: `Proxy to legacy endpoint ${endpoint}`,
        responses: { 200: { description: "OK" } },
      },
      get: {
        summary: `Proxy to legacy endpoint ${endpoint}`,
        responses: { 200: { description: "OK" } },
      },
    },
  ]),
);

export const openApiDocument = {
  openapi: "3.0.3",
  info: { title: "ACURA Office API", version: "1.0.0" },
  servers: [{ url: "/api" }],
  paths,
};
