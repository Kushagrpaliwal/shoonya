// pages/api/addToWatchlist.js
import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import User from "@/app/models/User";

export async function POST(req) {
  try {
    await connectToDatabase();

    const body = await req.json();
    console.log("Request Body:", body); // Log the incoming request body

    const { email, exchange, token } = body;

    if (!email || !exchange || !token) {
      return NextResponse.json({ error: "Email, exchange, and token are required." }, { status: 400 });
    }

    // Find the user by email and update their trades
    const user = await User.findOneAndUpdate(
      { email },
      { $addToSet: { trades: { exchange, token } } }, // Use $addToSet to avoid duplicates
      { new: true, upsert: true } // Create a new user if not found
    );

    console.log("User  after update:", user); // Log the updated user

    return NextResponse.json({ message: "Trade saved successfully", user }, { status: 201 });
  } catch (error) {
    console.error("Error saving trade:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}