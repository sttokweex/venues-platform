import { Venue } from "@entities/venue/model/types";
import { Modal } from "@shared/ui/Modal";
import { Button } from "@shared/ui/Button";

interface DeleteVenueModalProps {
    isOpen: boolean;
    onClose: () => void;
    venue: Venue;
    onConfirm: () => void;
}

export const DeleteVenueModal = ({ isOpen, onClose, venue, onConfirm }: DeleteVenueModalProps) => {
    if (!isOpen || !venue) {
        return null; // Не рендерим, если venue отсутствует
    }
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Confirm Deletion">
            <p className="mb-4">
                Are you sure you want to delete <strong>{venue.name}</strong>?
            </p>
            <div className="flex justify-end space-x-2">
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={onConfirm}>
                    Delete
                </Button>
            </div>
        </Modal>
    );
};
