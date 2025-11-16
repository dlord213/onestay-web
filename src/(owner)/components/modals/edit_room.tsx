/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, type FormEvent } from "react";
import { X, AlertCircle, Home, Check } from "lucide-react";
import { type Room, type UpdateRoomData, roomAPI } from "../../../api/room";

const ROOM_TYPES = [
  "Standard Room",
  "Deluxe Room",
  "Suite",
  "Family Room",
  "Presidential Suite",
  "Villa",
  "Cabin",
  "Bungalow",
];

const ROOM_STATUSES = [
  { value: "available", label: "Available" },
  { value: "maintenance", label: "Under Maintenance" },
  { value: "occupied", label: "Occupied" },
];

interface EditRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedRoom: Room) => void;
  roomToEdit: Room | null;
}

export default function EditRoomModal({
  isOpen,
  onClose,
  onSuccess,
  roomToEdit,
}: EditRoomModalProps) {
  const [formData, setFormData] = useState<UpdateRoomData>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && roomToEdit) {
      setFormData({
        room_type: roomToEdit.room_type,
        capacity: roomToEdit.capacity,
        price_per_night: roomToEdit.price_per_night,
        status: roomToEdit.status,
      });
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, roomToEdit]);

  const handleInputChange = (
    field: keyof UpdateRoomData,
    value: string | number
  ) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = (): boolean => {
    setError(null);
    if (!formData.room_type) {
      setError("Please select a room type");
      return false;
    }
    if (!formData.capacity || formData.capacity < 1) {
      setError("Capacity must be at least 1");
      return false;
    }
    if (!formData.price_per_night || formData.price_per_night < 1) {
      setError("Price must be at least ₱1");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!roomToEdit || !validateForm()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const result = await roomAPI.updateRoom(roomToEdit._id, formData);
      onSuccess(result);
      onClose();
    } catch (err) {
      console.error("Error updating room:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!roomToEdit) return null;

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <form onSubmit={handleSubmit} className="modal-box w-11/12 max-w-2xl">
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h3 className="font-bold text-2xl">Edit Room</h3>
        <p className="py-2 text-base-content/70">
          Update details for "{roomToEdit.room_type}"
        </p>

        {error && (
          <div className="alert alert-error shadow-lg mt-4">
            <div>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="form-control mt-4 space-y-5">
          <div>
            <label className="label">
              <span className="label-text font-bold">Room Type</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {ROOM_TYPES.map((type) => (
                <button
                  type="button"
                  key={type}
                  onClick={() => handleInputChange("room_type", type)}
                  className={`btn ${
                    formData.room_type === type
                      ? "btn-neutral"
                      : "btn-ghost border-base-300"
                  } justify-between`}
                >
                  <div className="flex items-center gap-2">
                    <Home size={16} />
                    {type}
                  </div>
                  {formData.room_type === type && <Check size={18} />}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-bold">Guest Capacity</span>
              </label>
              <div className="join w-full">
                <button
                  type="button"
                  className="btn join-item"
                  onClick={() =>
                    handleInputChange(
                      "capacity",
                      Math.max(1, (formData.capacity || 0) - 1)
                    )
                  }
                >
                  −
                </button>
                <span className="btn join-item pointer-events-none flex-1">
                  {formData.capacity} Guests
                </span>
                <button
                  type="button"
                  className="btn join-item"
                  onClick={() =>
                    handleInputChange(
                      "capacity",
                      Math.min(20, (formData.capacity || 0) + 1)
                    )
                  }
                >
                  +
                </button>
              </div>
            </div>

            <div>
              <label className="label">
                <span className="label-text font-bold">
                  Price per Night (PHP)
                </span>
              </label>
              <div className="join w-full">
                <span className="btn join-item pointer-events-none">₱</span>
                <input
                  type="number"
                  className="input input-bordered join-item w-full text-center"
                  value={formData.price_per_night}
                  onChange={(e) =>
                    handleInputChange(
                      "price_per_night",
                      Math.max(1, parseInt(e.target.value) || 0)
                    )
                  }
                  step={100}
                  min={1}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-bold">Room Status</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {ROOM_STATUSES.map((status) => (
                <button
                  type="button"
                  key={status.value}
                  onClick={() => handleInputChange("status", status.value)}
                  className={`btn ${
                    formData.status === status.value
                      ? "btn-neutral"
                      : "btn-ghost border-base-300"
                  }`}
                >
                  {status.label}
                  {formData.status === status.value && <Check size={18} />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="modal-action mt-6">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-neutral"
            disabled={isSubmitting}
          >
            {isSubmitting && <span className="loading loading-spinner"></span>}
            Save Changes
          </button>
        </div>
      </form>
    </dialog>
  );
}
