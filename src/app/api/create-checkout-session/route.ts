import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil",
});

export async function POST(req: NextRequest) {
    try {
        const { venueId, venueName, startDate, endDate, guests, totalPrice } = await req.json();
        const authToken = req.headers.get("Authorization")?.replace("Bearer ", "");

        console.log("Creating checkout session:", {
            venueId,
            venueName,
            startDate,
            endDate,
            guests,
            totalPrice,
            authToken,
        });

        if (!venueId || !venueName || !startDate || !endDate || !guests || !totalPrice) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (!authToken) {
            return NextResponse.json({ error: "No authentication token provided" }, { status: 401 });
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                global: { headers: { Authorization: `Bearer ${authToken}` } },
            }
        );

        const {
            data: { user },
            error: userError,
        } = await supabase.auth.getUser();
        if (userError || !user) {
            console.error("User fetch error:", userError?.message);
            return NextResponse.json({ error: "User not authenticated" }, { status: 401 });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `Booking: ${venueName}`,
                            description: `From ${new Date(startDate).toLocaleString()} to ${new Date(
                                endDate
                            ).toLocaleString()}, ${guests} guests`,
                        },
                        unit_amount: Math.round(totalPrice * 100), // В центах
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${req.headers.get("origin")}/venues/${venueId}?success=true`,
            cancel_url: `${req.headers.get("origin")}/venues/${venueId}?canceled=true`,
            metadata: {
                venueId,
                userId: user.id,
                startDate,
                endDate,
                guests,
                totalPrice,
            },
        });

        console.log("Checkout session created:", session.id);
        return NextResponse.json({ sessionId: session.id });
    } catch (err: any) {
        console.error("Error creating checkout session:", err.message);
        return NextResponse.json({ error: err.message || "Failed to create checkout session" }, { status: 500 });
    }
}
