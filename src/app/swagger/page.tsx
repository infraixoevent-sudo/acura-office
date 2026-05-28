"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";
import "swagger-ui-themes/themes/3.x/theme-monokai.css";

export default function SwaggerPage() {
  return (
    <main className="min-h-screen bg-[#111827] px-6 py-8">
      <SwaggerUI url="/api/swagger" />
    </main>
  );
}
