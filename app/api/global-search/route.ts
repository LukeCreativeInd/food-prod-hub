import { NextResponse, type NextRequest } from "next/server";

import { getGlobalSearchResults } from "@/lib/global-search";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q") ?? "";

  try {
    const results = await getGlobalSearchResults(query);

    return NextResponse.json(results);
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[global-search] Search failed", error);
    }

    return NextResponse.json(
      {
        query: query.trim().slice(0, 80),
        groups: [],
        error: "Search is temporarily unavailable.",
      },
      { status: 500 },
    );
  }
}
