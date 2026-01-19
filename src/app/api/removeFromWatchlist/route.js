import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import User from "@/app/models/User"; // Import your User model

export async function DELETE(req) {
  try {
    // Parse the request body
    const { email, exchange, token } = await req.json();

    // Check if the required fields are provided
    if (!email || !exchange || !token) {
      return NextResponse.json({ error: "Email, exchange, and token are required." }, { status: 400 });
    }

    // Connect to the database
    await connectToDatabase();

    // Find the user and remove the trade
    const user = await User.findOneAndUpdate(
      { email },
      { $pull: { trades: { exchange, token } } }, // Remove the specific trade
      { new: true } // Return the updated document
    );

    if (!user) {
      return NextResponse.json({ error: "User  not found." }, { status: 404 });
    }

    return NextResponse.json({ message: "Item removed from watchlist successfully." });
  } catch (error) {
    console.error("Error removing item from watchlist:", error); // Log the error
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}