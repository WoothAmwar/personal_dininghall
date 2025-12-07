import { NextResponse } from "next/server";
import { fetchDineOnCampusMenu } from "@/lib/Meals";

// Increase timeout for serverless function (max 60s on Vercel Pro, 10s on Hobby)
export const maxDuration = 10;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  try {
    const data = await fetchDineOnCampusMenu(url);
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Failed to fetch menu data", details: error.message },
      { status: 500 }
    );
  }
}
