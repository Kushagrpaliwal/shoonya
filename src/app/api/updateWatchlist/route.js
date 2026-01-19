import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import Watchlist from "@/app/models/Watchlist"; // Your Watchlist model

export async function POST(req) {
  try {
    await connectToDatabase();
    
    const { tsym, lp, bp1, sp1, h, l, o, c ,tk } = await req.json(); // Get the data from the request body

    // Validate input
    if (!tsym || !lp || !bp1 || !sp1 || !h || !l || !o || !c || !tk) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Update the watchlist entry in MongoDB
    const updatedItem = await Watchlist.findOneAndUpdate(
      { tsym },
      { lp, bp1, sp1, h, l, o, c , tk},
      { new: true }
    );

    if (!updatedItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Watchlist updated", item: updatedItem }, { status: 200 });
  } catch (error) {
    console.error("Error updating watchlist:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}