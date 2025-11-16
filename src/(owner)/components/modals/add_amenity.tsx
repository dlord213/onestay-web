import { useState, useEffect, type FormEvent } from "react";
import { X, AlertCircle, Sparkles } from "lucide-react";
import {
  type Amenity,
  amenityAPI,
  type CreateAmenityData,
} from "../../../api/amenity";
import { useAuthStore } from "../../../(auth)/store/Auth";

interface AmenityEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (amenity: Amenity) => void;
  resortId: string;
  amenityToEdit: Amenity | null;
}

export default function AmenityEditorModal({
  isOpen,
  onClose,
  onSuccess,
  resortId,
  amenityToEdit,
}: AmenityEditorModalProps) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  const isEditMode = amenityToEdit !== null;
  const title = isEditMode ? "Edit Amenity" : "Add New Amenity";

  useEffect(() => {
    if (isOpen) {
      if (isEditMode) {
        setName(amenityToEdit.name);
      } else {
        setName("");
      }
      setError(null);
      setIsSubmitting(false);
    }
  }, [isOpen, amenityToEdit, isEditMode]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Amenity name cannot be empty.");
      return;
    }

    setIsSubmitting(true);
    try {
      let result: Amenity;
      if (isEditMode) {
        result = await amenityAPI.updateAmenity(
          amenityToEdit._id,
          { name },
          token!
        );
      } else {
        const amenityData: CreateAmenityData = {
          resort_id: resortId,
          name: name.trim(),
        };
        result = await amenityAPI.createAmenity(amenityData, token!);
      }

      onSuccess(result);
      onClose();
    } catch (err) {
      console.error("Error saving amenity:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <form onSubmit={handleSubmit} className="modal-box w-11/12 max-w-lg">
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          <X size={20} />
        </button>
        <h3 className="font-bold text-2xl">{title}</h3>

        {error && (
          <div className="alert alert-error shadow-lg mt-4">
            <div>
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="form-control py-4">
          <fieldset className="fieldset">
            <legend className="fieldset-legend">Amenity Name</legend>
            <div className="join w-full">
              <span className="btn join-item pointer-events-none border-base-300">
                <Sparkles size={18} />
              </span>
              <input
                type="text"
                className="input input-bordered w-full join-item"
                placeholder="e.g., Swimming Pool, WiFi, Gym"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </fieldset>
        </div>

        <div className="modal-action">
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
            disabled={isSubmitting || !name.trim()}
          >
            {isSubmitting && <span className="loading loading-spinner"></span>}
            {isEditMode ? "Save Changes" : "Add Amenity"}
          </button>
        </div>
      </form>
    </dialog>
  );
}
