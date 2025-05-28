"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@shared/lib/supabase";
import { Venue } from "@entities/venue/model/types";
import { Card } from "@shared/ui/Card";
import { Button } from "@shared/ui/Button";
import { Spinner } from "@shared/ui/Spinner";

export default function Home() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVenues = async () => {
            setLoading(true);
            const { data, error } = await supabase.from("venues").select("*");
            if (error) {
                console.error("Error fetching venues:", error);
            } else {
                setVenues(data as Venue[]);
            }
            setLoading(false);
        };
        fetchVenues();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Spinner />
            </div>
        );
    }

    return (
        <div className="container py-12">
            <h1 className="text-4xl font-bold text-center mb-12 animate-fade-in">Explore Our Venues</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {venues.map((venue) => (
                    <Link key={venue.id} href={`/venues/${venue.id}`} className="group">
                        <Card className="h-full transition-transform duration-200 transform group-hover:scale-105 group-hover:shadow-lg animate-slide-up">
                            {venue.image_url && (
                                <img
                                    src={venue.image_url}
                                    alt={venue.name}
                                    className="w-full h-48 object-cover rounded-t-lg"
                                />
                            )}
                            <div className="p-6">
                                <h2 className="text-xl font-semibold mb-2">{venue.name}</h2>
                                <p className="text-neutral-600 mb-2 line-clamp-2">{venue.address}</p>
                                <p className="text-neutral-600 mb-4">Capacity: {venue.capacity}</p>
                                <Button
                                    variant="primary"
                                    size="sm"
                                    className="w-full transition-transform duration-200 hover:scale-105"
                                >
                                    View Details
                                </Button>
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
            {venues.length === 0 && <p className="text-center text-neutral-600 mt-12">No venues available.</p>}
        </div>
    );
}
