import { NextResponse } from "next/server";

import { getProductCardData } from "@/server/storefront/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim() ?? "";
  const limitParam = Number(searchParams.get("limit") ?? 6);
  const limit = Number.isNaN(limitParam) ? 6 : Math.min(limitParam, 24);

  if (!query) {
    return NextResponse.json({ products: [] });
  }

  try {
    const products = await getProductCardData({ search: query, limit });
    return NextResponse.json({ products });
  } catch (error) {
    console.error("Product search failed", error);
    return NextResponse.json(
      { products: [], error: "Unable to fetch products" },
      { status: 500 }
    );
  }
}
