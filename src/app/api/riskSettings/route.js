import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import RiskSettings from "@/app/models/RiskSettings";

/**
 * Get risk settings for a user
 * GET /api/riskSettings?email=...
 */
export async function GET(req) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        let settings = await RiskSettings.findOne({ email });

        if (!settings) {
            // Return defaults if not found, but don't create yet strictly unless requested? 
            // Better to return defaults so frontend can work.
            return NextResponse.json({
                maxDailyLoss: 5000,
                maxTradesPerDay: 10,
                maxConsecutiveLosses: 3
            });
        }

        return NextResponse.json(settings);
    } catch (error) {
        console.error("Error fetching risk settings:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Update risk settings
 * POST /api/riskSettings
 * Body: { email, maxDailyLoss, maxTradesPerDay, maxConsecutiveLosses }
 */
export async function POST(req) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { email, maxDailyLoss, maxTradesPerDay, maxConsecutiveLosses } = body;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        let settings = await RiskSettings.findOne({ email });

        if (!settings) {
            settings = new RiskSettings({
                email,
                maxDailyLoss,
                maxTradesPerDay,
                maxConsecutiveLosses
            });
        } else {
            settings.maxDailyLoss = maxDailyLoss;
            settings.maxTradesPerDay = maxTradesPerDay;
            settings.maxConsecutiveLosses = maxConsecutiveLosses;
            settings.updatedAt = new Date();
        }

        await settings.save();

        return NextResponse.json({ success: true, settings });
    } catch (error) {
        console.error("Error updating risk settings:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
