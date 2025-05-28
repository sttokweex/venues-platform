"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@shared/lib/supabase";

import { Venue } from "@entities/venue/model/types";
import { Card } from "@shared/ui/Card";
import { Button } from "@shared/ui/Button";
import { Spinner } from "@shared/ui/Spinner";
import { loadStripe } from "@stripe/stripe-js";
import { generatePDF } from "@features/pdf-generation/lib/generatePdf";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function VenueDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [venue, setVenue] = useState<Venue | null>(null);
    const [loading, setLoading] = useState(true);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [guests, setGuests] = useState("");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const checkUserAndFetchVenue = async () => {
            setLoading(true);
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) {
                router.push("/auth");
                return;
            }

            if (!id) {
                console.error("No venue ID provided");
                router.push("/");
                return;
            }

            const { data, error } = await supabase.from("venues").select("*").eq("id", id).single();

            if (error) {
                console.error("Error fetching venue:", error);
                router.push("/");
            } else {
                setVenue(data as Venue);
                setLoading(false);
            }
        };

        checkUserAndFetchVenue();
    }, [router, id]);

    const handleBooking = async () => {
        if (!startDate || !endDate || !guests || Number(guests) <= 0) {
            setError("Please fill in all fields with valid values.");
            return;
        }

        setBookingLoading(true);
        setError(null);

        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();
            if (!session) {
                throw new Error("No active session");
            }

            const response = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    venueId: id,
                    venueName: venue?.name,
                    startDate,
                    endDate,
                    guests: Number(guests),
                    totalPrice: Number(guests) * 100,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || "Failed to create checkout session");
            }

            const { sessionId } = data;
            if (!sessionId) {
                throw new Error("No sessionId returned from server");
            }

            const stripe = await stripePromise;
            if (!stripe) throw new Error("Stripe not initialized");

            const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
            if (stripeError) throw stripeError;
        } catch (err: any) {
            setError(err.message || "Error initiating payment");
            console.error("Booking error:", err);
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    if (!venue) {
        return null;
    }

    return (
        <div className="container py-12">
            <Card className="animate-fade-in">
                <div className="flex flex-col lg:flex-row gap-8">
                    <div className="lg:w-1/2">
                        {venue.image_url && (
                            <img
                                src={venue.image_url}
                                alt={venue.name}
                                className="w-full h-96 object-cover rounded-lg shadow-md transition-transform duration-300 hover:scale-[1.02]"
                            />
                        )}
                    </div>
                    <div className="lg:w-1/2 space-y-6">
                        <div>
                            <Link href="/" className="text-primary-500 hover:underline mb-4 inline-block">
                                ← Back to Venues
                            </Link>
                            <h1 className="text-3xl font-bold">{venue.name}</h1>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <p className="text-neutral-600">
                                <span className="font-semibold">Address:</span> {venue.address}
                            </p>
                            <p className="text-neutral-600">
                                <span className="font-semibold">Capacity:</span> {venue.capacity}
                            </p>
                            <p className="text-neutral-600">
                                <span className="font-semibold">Phone:</span> {venue.phone || "N/A"}
                            </p>
                            <p className="text-neutral-600">
                                <span className="font-semibold">Created:</span>{" "}
                                {new Date(venue.created_at).toLocaleDateString()}
                            </p>
                            <p className="text-neutral-600">
                                <span className="font-semibold">Event Date:</span>{" "}
                                {venue.event_date ? new Date(venue.event_date).toLocaleString() : "N/A"}
                            </p>
                        </div>
                        <Button
                            variant="secondary"
                            size="lg"
                            onClick={() => generatePDF(venue)}
                            className="w-full sm:w-auto transition-transform duration-200 hover:scale-105"
                        >
                            Download PDF
                        </Button>

                        <h2 className="text-2xl font-semibold mt-8">Book This Venue</h2>
                        {error && (
                            <div className="bg-red-100 text-red-700 p-4 rounded-lg animate-slide-up">{error}</div>
                        )}
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="startDate" className="block text-sm font-medium text-neutral-700">
                                    Start Date
                                </label>
                                <input
                                    id="startDate"
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="mt-1 block w-full p-3 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label htmlFor="endDate" className="block text-sm font-medium text-neutral-700">
                                    End Date
                                </label>
                                <input
                                    id="endDate"
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="mt-1 block w-full p-3 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                                />
                            </div>
                            <div>
                                <label htmlFor="guests" className="block text-sm font-medium text-neutral-700">
                                    Number of Guests
                                </label>
                                <input
                                    id="guests"
                                    type="number"
                                    value={guests}
                                    onChange={(e) => setGuests(e.target.value)}
                                    className="mt-1 block w-full p-3 border border-neutral-300 rounded-lg focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
                                    min="1"
                                />
                            </div>
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={handleBooking}
                                disabled={bookingLoading}
                                className="w-full transition-transform duration-200 hover:scale-105"
                            >
                                {bookingLoading ? "Processing..." : "Book Now"}
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
