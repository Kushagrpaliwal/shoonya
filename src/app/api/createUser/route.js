import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import User from "@/app/models/User";

export async function POST(req) {
  try {
    await connectToDatabase();
    const { email, password, name } = await req.json();

    // Validate required fields
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "All required fields must be provided" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Create new user with plain text password
    const newUser = new User({
      email,
      password: password,
      name,
      createdAt: new Date(),
      // Initialize empty arrays for trades and orders
      trades: [],
      buyOrders: [],
      sellOrders: [],
      trash: []
    });

    await newUser.save();

    // Return success response (don't include password)
    const userResponse = {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,   
      createdAt: newUser.createdAt
    };

    return NextResponse.json(
      { 
        message: "User created successfully", 
        user: userResponse 
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
