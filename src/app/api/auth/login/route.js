import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import User from "@/app/models/User";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    // Find the user by email
    let user = await User.findOne({ email });

    // If user not found, return error
    if (!user) {
      return NextResponse.json({ error: "User not found. Please sign up." }, { status: 404 });
    }

    // Check if password matches (plain text comparison)
    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Successful login
    return NextResponse.json({
      message: "Login successful",
      email: user.email,
      // name: user.name, // removed as likely not in schema
      // loginId: user.loginId // removed as likely not in schema
    }, { status: 200 });

  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
