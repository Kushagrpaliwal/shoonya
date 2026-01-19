import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import User from "@/app/models/User";

export async function POST(req) {
    try {
        await connectToDatabase();
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
        }

        // Check if user already exists
        let user = await User.findOne({ email });

        if (user) {
            return NextResponse.json({ error: "User already exists. Please login." }, { status: 400 });
        }

        // Create new user
        user = new User({
            email,
            password, // Plain text as per existing implementation (should be hashed in prod)
            // name and loginId were in existing login logic, adding them if schema allows or requires
            // User model schema has email, password. name and loginId are commented out in User.js.
            // But login/route.js was adding them?
            // "name: 'New User', loginId: Date.now().toString()"
            // User.js lines 46-47 are commented out.
            // So passed values are probably ignored unless schema has strict: false?
            // Mongoose defaults to strict: true.
            // So I should stick to email/password unless I uncomment lines in User.js.
            // Wait, User.js has `buyOrders`, `sellOrders` etc.
            // The previous login route was creating `name` and `loginId` even if commented out? 
            // Maybe the User.js I read was edited recently or I misread?
            // Lines 46-47 are indeed commented out.
            // So saving `name` would fail validation? No, strict mode strips them.
            // I'll stick to email/password.
        });

        await user.save();

        return NextResponse.json({
            message: "User created successfully",
            email: user.email
        }, { status: 201 });

    } catch (error) {
        console.error("Error during signup:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
