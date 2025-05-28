import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import { sendBookingConfirmationEmail } from "@shared/lib/mailgun";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2025-04-30.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
    console.log("Webhook endpoint hit:", new Date().toISOString());

    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
        console.log("Webhook event received:", event.type);
    } catch (err: any) {
        console.error("Webhook signature verification failed:", err.message);
        return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log("Checkout session:", JSON.stringify(session, null, 2));

        const { venueId, userId, startDate, endDate, guests, totalPrice } = session.metadata || {};

        console.log("Metadata:", JSON.stringify({ venueId, userId, startDate, endDate, guests, totalPrice }, null, 2));

        if (!venueId || !userId || !startDate || !endDate || !guests || !totalPrice) {
            console.error("Missing metadata:", session.metadata);
            return NextResponse.json({ error: "Missing metadata" }, { status: 400 });
        }

        try {
            const supabase = createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.SUPABASE_SERVICE_ROLE_KEY!,
                { auth: { autoRefreshToken: false, persistSession: false } }
            );

            const bookingData = {
                user_id: userId,
                venue_id: venueId,
                start_date: new Date(startDate).toISOString(),
                end_date: new Date(endDate).toISOString(),
                guests: parseInt(guests, 10),
                total_price: parseFloat(totalPrice),
                status: "confirmed",
                stripe_payment_id: session.payment_intent ? String(session.payment_intent) : null,
            };

            console.log("Inserting booking:", JSON.stringify(bookingData, null, 2));

            const { error } = await supabase.from("bookings").insert(bookingData);

            if (error) {
                console.error(
                    "Supabase error:",
                    JSON.stringify({ message: error.message, details: error.details, hint: error.hint }, null, 2)
                );
                return NextResponse.json({ error: "Failed to save booking", details: error.message }, { status: 500 });
            }

            console.log("Booking saved successfully");

            // Fetch user and venue for email
            const { data: user } = await supabase.from("users").select("email, name").eq("id", userId).single();
            const { data: venue } = await supabase.from("venues").select("name").eq("id", venueId).single();

            if (user && venue) {
                await sendBookingConfirmationEmail(
                    user.email,
                    user.name || "User",
                    venue.name,
                    startDate,
                    endDate,
                    parseInt(guests, 10),
                    parseFloat(totalPrice)
                );
            } else {
                console.error("Failed to fetch user or venue for email:", { user, venue });
            }
        } catch (err: any) {
            console.error("Webhook processing error:", err.message, err.stack);
            return NextResponse.json({ error: "Webhook processing failed", details: err.message }, { status: 500 });
        }
    }

    return NextResponse.json({ received: true });
}
