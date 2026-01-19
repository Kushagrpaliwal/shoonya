import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import User from "@/app/models/User";

export async function GET(req) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");

    let users;

    if (email) {
      users = await User.find({ email });
      if (users.length === 0) {
        return NextResponse.json({ error: "User not found." }, { status: 404 });
      }
    } else {
      users = await User.find({});
    }

    return NextResponse.json({ users }, { status: 200 });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
