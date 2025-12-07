import { NextResponse } from "next/server";
import { fetchDineOnCampusMenu } from "@/lib/Meals";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  const data = await fetchDineOnCampusMenu(url);
  return NextResponse.json(data);
}
