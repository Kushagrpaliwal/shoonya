import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import MistakeLog from "@/app/models/MistakeLog";

/**
 * Get mistake log for a user
 * GET /api/mistakeLog?email=...
 */
export async function GET(req) {
    try {
        await connectToDatabase();
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        const log = await MistakeLog.findOne({ email });

        return NextResponse.json({
            mistakes: log ? log.mistakes : []
        });
    } catch (error) {
        console.error("Error fetching mistake log:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

/**
 * Add or sync mistakes
 * POST /api/mistakeLog
 * Body: { email, mistakes: [...] }
 */
export async function POST(req) {
    try {
        await connectToDatabase();
        const body = await req.json();
        const { email, mistakes } = body;

        if (!email || !Array.isArray(mistakes)) {
            return NextResponse.json({ error: "Email and mistakes array are required" }, { status: 400 });
        }

        let log = await MistakeLog.findOne({ email });

        if (!log) {
            log = new MistakeLog({
                email,
                mistakes: []
            });
        }

        // Add new mistakes avoiding duplicates based on tradeId and mistakeType
        // tradeId might be null for some mock trades, so fallback to checking other props if needed, but assuming tradeId is best.
        // If tradeId is missing, we might duplicate. The detectMistakes function should passing tradeId if available.

        let addedCount = 0;

        for (const newMistake of mistakes) {
            // Check if this specific mistake for this trade already exists
            const exists = log.mistakes.some(m =>
                (m.tradeId && m.tradeId === newMistake.tradeId && m.mistakeType === newMistake.mistakeType) ||
                // Fallback for missing tradeIds in mock data: check timestamp and symbol and type
                (!m.tradeId && !newMistake.tradeId && m.timestamp.getTime() === new Date(newMistake.timestamp).getTime() && m.symbol === newMistake.symbol && m.mistakeType === newMistake.mistakeType)
            );

            if (!exists) {
                log.mistakes.push(newMistake);
                addedCount++;
            }
        }

        if (addedCount > 0) {
            log.updatedAt = new Date();
            await log.save();
        }

        return NextResponse.json({
            success: true,
            added: addedCount,
            total: log.mistakes.length,
            mistakes: log.mistakes
        });
    } catch (error) {
        console.error("Error updating mistake log:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
