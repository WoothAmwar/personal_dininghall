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

  // connection string
  const MONGODB_URI = "mongodb+srv://anwar09102005_db_user:loWPghkNOckAIXzL@cluster0.tu8or27.mongodb.net/?appName=Cluster0";

  try {
    // 1. Attempt to fetch from MongoDB first to avoid scraping time/cost
    // Extract date and meal from URL: .../2026-02-14/breakfast
    const parts = url.split('/');
    if (parts.length >= 2) {
      const dateStr = parts[parts.length - 2]; // e.g. "2026-02-14"
      const mealType = parts[parts.length - 1]; // e.g. "breakfast"

      // Convert YYYY-MM-DD -> M/D/YY (to match how scraper saves it: "2/14/26")
      // Handle both "2026-02-14" and "2026-2-14" (no padding)
      const [year, month, day] = dateStr.split('-');
      if (year && month && day) {
        const shortYear = year.slice(-2);
        // Remove leading zeros by converting to Number
        const dbDate = `${Number(month)}/${Number(day)}/${shortYear}`;

        const { MongoClient } = await import('mongodb');
        const client = new MongoClient(MONGODB_URI);

        try {
          await client.connect();
          const db = client.db('dininghall');
          const collection = db.collection('meals');

          const doc = await collection.findOne({ date: dbDate });

          // If we have the document AND data for the specific meal
          if (doc && doc[mealType]) {
            console.log(`Serving ${mealType} for ${dbDate} from MongoDB`);
            return NextResponse.json({
              date: doc.date,
              location: "Woodlawn Dining Commons", // Default based on URL
              meal: mealType,
              sections: doc[mealType]
            });
          }
        } finally {
          await client.close();
        }
      }
    }
  } catch (dbError) {
    console.warn("MongoDB fetch failed, falling back to scraper:", dbError);
    // Proceed to scraper if DB fails
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
