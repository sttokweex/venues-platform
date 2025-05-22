import Link from "next/link";
import { Venue } from "@entities/venue/model/types";
import { Button } from "@shared/ui/Button";
import { Card } from "@shared/ui/Card";

interface VenueListProps {
    venues: Venue[];
    onEdit: (venue: Venue) => void;
    onDelete: (venue: Venue) => void;
}

export const VenueList = ({ venues, onEdit, onDelete }: VenueListProps) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map((venue) => (
                <Card key={venue.id}>
                    <h3 className="text-lg font-semibold">
                        <Link href={`/venues/${venue.id}`} className="text-blue-600 hover:underline">
                            {venue.name}
                        </Link>
                    </h3>
                    {venue.image_url && (
                        <img
                            src={venue.image_url}
                            alt={venue.name}
                            className="w-full h-48 object-cover rounded-lg mt-2"
                        />
                    )}
                    <p className="text-gray-600 mt-2">Address: {venue.address}</p>
                    <p className="text-gray-600">Capacity: {venue.capacity}</p>
                    <p className="text-gray-600">Phone: {venue.phone || "N/A"}</p>
                    <p className="text-gray-600">
                        Event Date: {venue.event_date ? new Date(venue.event_date).toLocaleString() : "N/A"}
                    </p>
                    <div className="flex space-x-2 mt-4">
                        <Button variant="primary" size="sm" onClick={() => onEdit(venue)}>
                            Edit
                        </Button>
                        <Button variant="danger" size="sm" onClick={() => onDelete(venue)}>
                            Delete
                        </Button>
                    </div>
                </Card>
            ))}
        </div>
    );
};
