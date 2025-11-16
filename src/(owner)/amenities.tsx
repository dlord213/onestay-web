/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-useless-catch */
import { useEffect, useState, useCallback } from "react";
import { amenityAPI, type Amenity } from "../api/amenity";
import Sidebar from "./components/sidebar";
import { useResortStore } from "./store/resort";
import { Plus, AlertCircle, Inbox, Edit, Trash2, Sparkles } from "lucide-react";
import { useAuthStore } from "../(auth)/store/Auth";
import AmenityEditorModal from "./components/modals/add_amenity";
import DeleteConfirmationModal from "./components/modals/delete_amenity";

const LoadingComponent = () => (
  <div className="flex justify-center items-center col-span-full h-64">
    <div className="loading loading-spinner loading-lg text-primary"></div>
  </div>
);

const ErrorComponent = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="alert alert-error shadow-lg col-span-full">
    <div className="flex-1">
      <AlertCircle size={48} />
      <div>
        <h3 className="font-bold text-xl">Failed to load amenities</h3>
        <p className="text-sm py-2">{message}</p>
      </div>
    </div>
    <button className="btn btn-sm btn-error-content" onClick={onRetry}>
      Try Again
    </button>
  </div>
);

const EmptyComponent = () => (
  <div className="flex flex-col justify-center items-center text-center col-span-full h-64">
    <Inbox size={48} className="mb-4 opacity-50" />
    <h3 className="font-bold text-xl">No Amenities Found</h3>
    <p className="text-sm py-2 opacity-70">
      Click "Add Amenity" to create your first one.
    </p>
  </div>
);

export default function AmenitiesScreen() {
  const [amenities, setAmenities] = useState<Amenity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedAmenity, setSelectedAmenity] = useState<Amenity | null>(null);

  const { resorts, hasResorts, loading: resortsLoading } = useResortStore();
  const currentResortId = hasResorts ? resorts[0]._id : null;

  const fetchAmenities = useCallback(async () => {
    if (!currentResortId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await amenityAPI.getAmenitiesByResort(currentResortId);
      setAmenities(response);
    } catch (error: any) {
      console.error("Error fetching amenities:", error);
      setError(error.message || "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  }, [currentResortId]);

  useEffect(() => {
    fetchAmenities();
  }, [fetchAmenities]);

  const openAddModal = () => {
    setSelectedAmenity(null);
    setIsEditorOpen(true);
  };

  const openEditModal = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setIsEditorOpen(true);
  };

  const openDeleteModal = (amenity: Amenity) => {
    setSelectedAmenity(amenity);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsEditorOpen(false);
    setIsDeleteModalOpen(false);
    setSelectedAmenity(null);
  };

  const handleEditorSuccess = (updatedAmenity: Amenity) => {
    const exists = amenities.some((a) => a._id === updatedAmenity._id);
    if (exists) {
      setAmenities((prev) =>
        prev.map((a) => (a._id === updatedAmenity._id ? updatedAmenity : a))
      );
    } else {
      // Add
      setAmenities((prev) => [...prev, updatedAmenity]);
    }
    closeModals();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedAmenity) return;

    try {
      await amenityAPI.deleteAmenity(selectedAmenity._id, token!);
      setAmenities((prev) => prev.filter((a) => a._id !== selectedAmenity._id));
      closeModals();
    } catch (err) {
      throw err;
    }
  };

  const renderContent = () => {
    if (loading || resortsLoading) {
      return <LoadingComponent />;
    }
    if (error) {
      return <ErrorComponent message={error} onRetry={fetchAmenities} />;
    }
    if (amenities.length === 0) {
      return <EmptyComponent />;
    }

    return amenities.map((amenity) => (
      <div key={amenity._id} className="card bg-base-200 shadow-sm">
        <div className="card-body flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <Sparkles size={20} className="text-secondary" />
            <h2 className="card-title">{amenity.name}</h2>
          </div>
          <div className="card-actions">
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => openEditModal(amenity)}
            >
              <Edit size={16} />
              Edit
            </button>
            <button
              className="btn btn-ghost btn-sm text-error"
              onClick={() => openDeleteModal(amenity)}
            >
              <Trash2 size={16} />
              Delete
            </button>
          </div>
        </div>
      </div>
    ));
  };

  return (
    <>
      <main className="relative grid grid-cols-[0.2fr_1fr] h-dvh bg-base-100">
        <Sidebar />
        <div className="flex flex-col gap-8 p-12 overflow-y-auto">
          <div className="flex flex-row items-center justify-between">
            <h1 className="lg:text-4xl font-bold">Amenities</h1>
            <button
              className="btn btn-primary"
              onClick={openAddModal}
              disabled={!hasResorts || loading}
            >
              <Plus size={18} />
              Add Amenity
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderContent()}
          </div>
        </div>
      </main>

      {currentResortId && (
        <AmenityEditorModal
          isOpen={isEditorOpen}
          onClose={closeModals}
          onSuccess={handleEditorSuccess}
          resortId={currentResortId}
          amenityToEdit={selectedAmenity}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeModals}
        onConfirm={handleDeleteConfirm}
        title="Delete Amenity"
        message={`Are you sure you want to delete "${selectedAmenity?.name}"? This action cannot be undone.`}
      />
    </>
  );
}
