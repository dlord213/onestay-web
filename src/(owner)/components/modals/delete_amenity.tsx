import { useState } from "react";
import { X, AlertTriangle, AlertCircle } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: DeleteConfirmationModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setError(null);
    setIsDeleting(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
      setError(err instanceof Error ? err.message : "Failed to delete.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""}`}>
      <div className="modal-box">
        <button
          type="button"
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
          disabled={isDeleting}
        >
          <X size={20} />
        </button>

        <div className="flex items-center gap-4">
          <div className="shrink-0">
            <AlertTriangle size={32} className="text-error" />
          </div>
          <div>
            <h3 className="font-bold text-xl">{title}</h3>
            <p className="py-2 text-base-content/80">{message}</p>
          </div>
        </div>

        {error && (
          <div className="alert alert-error shadow-lg mt-4 text-sm">
            <div>
              <AlertCircle size={18} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="modal-action">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-error"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting && <span className="loading loading-spinner"></span>}
            Delete
          </button>
        </div>
      </div>
    </dialog>
  );
}
