import { NextResponse } from "next/server";
import { connectToDatabase } from "@/app/lib/connectToDatabase";
import Inventory from "@/app/models/Inventory";

/**
 * Get user inventory
 * Returns all symbols owned by the user with lots > 0
 */
export async function GET(req) {
    try {
        await connectToDatabase();

        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Find inventory for user from dedicated collection
        const inventory = await Inventory.findOne({ email });

        if (!inventory) {
            return NextResponse.json({ inventory: [] }, { status: 200 });
        }

        // Return items with lots > 0
        const activeItems = inventory.items.filter(item => item.lots > 0);

        return NextResponse.json({ inventory: activeItems }, { status: 200 });
    } catch (error) {
        console.error("Error fetching inventory:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
