import { Venue } from "@entities/venue/model/types";
import { VenueForm } from "./VenueForm";
import { Modal } from "@shared/ui/Modal";
import { VenueFormValues } from "../model/types";

interface EditVenueModalProps {
    isOpen: boolean;
    onClose: () => void;
    venue: Venue | null; // Изменяем на опциональный
    onSubmit: (values: VenueFormValues) => void;
}

export const EditVenueModal = ({ isOpen, onClose, venue, onSubmit }: EditVenueModalProps) => {
    if (!isOpen || !venue) {
        return null; // Не рендерим, если venue отсутствует
    }

    const initialValues: VenueFormValues = {
        name: venue.name,
        address: venue.address,
        capacity: venue.capacity.toString(),
        phone: venue.phone || "",
        image: null,
        event_date: venue.event_date ? new Date(venue.event_date).toISOString().slice(0, 16) : "",
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Edit Venue">
            <VenueForm
                initialValues={initialValues}
                onSubmit={(values) => {
                    onSubmit(values);
                }}
            />
            {venue.image_url && (
                <p className="text-sm text-gray-500 mt-2">
                    Current Image:{" "}
                    <a href={venue.image_url} target="_blank" className="text-blue-600 hover:underline">
                        View
                    </a>
                </p>
            )}
        </Modal>
    );
};
