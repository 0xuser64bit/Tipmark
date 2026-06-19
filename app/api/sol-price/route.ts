import { NextResponse } from "next/server";
import { getSolPrice } from "@/actions/getSolPrice";

export const revalidate = 60;

export async function GET() {
  const usd = await getSolPrice();
  return NextResponse.json(
    { usd },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    },
  );
}
