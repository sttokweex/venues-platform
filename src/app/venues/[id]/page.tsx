"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@shared/lib/supabase";
import { generatePDF } from "@features/pdf-generation/lib/generatePdf";
import { Venue } from "@entities/venue/model/types";
import { Card } from "@shared/ui/Card";
import { Button } from "@shared/ui/Button";
import { Spinner } from "@shared/ui/Spinner";

export default function VenueDetail({ params }: { params: { id: string } }) {
    const [venue, setVenue] = useState<Venue | null>(null);
    const [loading, setLoading] = useState(true);
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

            if (!params.id) {
                console.error("No venue ID provided");
                router.push("/");
                return;
            }

            const { data, error } = await supabase.from("venues").select("*").eq("id", params.id).single();

            if (error) {
                console.error("Error fetching venue:", error);
                router.push("/");
            } else {
                setVenue(data as Venue);
                setLoading(false);
            }
        };

        checkUserAndFetchVenue();
    }, [router, params.id]);

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
        <div className="container mx-auto p-6">
            <Card>
                <Link href="/" className="text-blue-600 hover:underline mb-4 inline-block">
                    Back to Home
                </Link>
                <h1 className="text-3xl font-bold mb-4">{venue.name}</h1>
                {venue.image_url && (
                    <img src={venue.image_url} alt={venue.name} className="w-full h-64 object-cover rounded-lg mb-4" />
                )}
                <p className="text-gray-600 mb-2">Address: {venue.address}</p>
                <p className="text-gray-600 mb-2">Capacity: {venue.capacity}</p>
                <p className="text-gray-600 mb-2">Phone: {venue.phone || "N/A"}</p>
                <p className="text-gray-600 mb-2">Created: {new Date(venue.created_at).toLocaleDateString()}</p>
                <p className="text-gray-600 mb-4">
                    Event Date: {venue.event_date ? new Date(venue.event_date).toLocaleString() : "N/A"}
                </p>
                <Button variant="primary" size="lg" onClick={() => generatePDF(venue)}>
                    Download PDF
                </Button>
            </Card>
        </div>
    );
}
