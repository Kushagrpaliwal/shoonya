import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import User from "@/app/models/User"; 

export async function POST(req) {
  try {
    await connectToDatabase();
    const { email, password } = await req.json();

    // Find the user by email
    let user = await User.findOne({ email });

    // If user not found, create a new one
    if (!user) {
      user = new User({
        email,
        password, // You can later hash this before saving (recommended)
        name: "New User",
        loginId: Date.now().toString(), // Generate a simple unique ID
      });
      await user.save();

      return NextResponse.json({
        message: "User created and logged in successfully",
        email: user.email,
        name: user.name,
        loginId: user.loginId
      }, { status: 201 });
    }

    // Check if password matches (plain text comparison)
    if (user.password !== password) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Successful login
    return NextResponse.json({
      message: "Login successful",
      email: user.email,
      name: user.name,
      loginId: user.loginId
    }, { status: 200 });

  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
