/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L, { LatLng } from "leaflet";
import { LocateFixed, X } from "lucide-react";

// --- Fix for default Leaflet icon (common issue in React) ---
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});
// --- End of icon fix ---

interface LocationCoords {
  latitude: number;
  longitude: number;
}

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLocationSelect: (location: LocationCoords) => void;
  initialLocation?: LocationCoords;
}

/**
 * A component to handle map click events
 */
function MapClickEvents({ onSelect }: { onSelect: (latlng: LatLng) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
}

/**
 * A component to make the selected marker draggable
 */
function DraggableMarker({
  position,
  setPosition,
}: {
  position: LatLng;
  setPosition: (latlng: LatLng) => void;
}) {
  const markerRef = useRef<L.Marker>(null);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [setPosition]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    >
      <Popup>Drag to adjust location</Popup>
    </Marker>
  );
}

/**
 * A component to center the map
 */
function MapCentering({ center, zoom }: { center: LatLng; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom);
  }, [center, zoom, map]);
  return null;
}

/**
 * Web-native Map Location Picker using OpenStreetMap via react-leaflet
 */
export default function MapPickerModal({
  isOpen,
  onClose,
  onLocationSelect,
  initialLocation,
}: MapPickerModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LatLng | null>(null);
  const [mapCenter, setMapCenter] = useState(
    new LatLng(8.4803, 124.6498) // Default center (from your code)
  );
  const [mapZoom, setMapZoom] = useState(13);
  const [loadingLocation, setLoadingLocation] = useState(false);

  // Set initial location when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialLocation) {
        const initialLatLng = new LatLng(
          initialLocation.latitude,
          initialLocation.longitude
        );
        setSelectedLocation(initialLatLng);
        setMapCenter(initialLatLng);
        setMapZoom(15);
      } else {
        // If no initial location, reset
        setSelectedLocation(null);
        setMapZoom(13);
      }
    }
  }, [isOpen, initialLocation]);

  // Get user's current location (replaces expo-location)
  const findMyLocation = () => {
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        const latLng = new LatLng(coords.latitude, coords.longitude);
        setCurrentLocation(latLng);
        setMapCenter(latLng); // Fly map to this new location
        setMapZoom(15);
        setLoadingLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert("Could not get your current location.");
        setLoadingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect({
        latitude: selectedLocation.lat,
        longitude: selectedLocation.lng,
      });
    } else {
      alert("Please tap on the map to select a location.");
    }
  };

  return (
    <dialog className={`modal ${isOpen ? "modal-open" : ""} z-50`}>
      <div className="modal-box w-11/12 max-w-4xl h-[80vh] flex flex-col p-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-200">
          <h3 className="font-bold text-lg">Select Resort Location</h3>
          <button className="btn btn-sm btn-circle btn-ghost" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Component to update map center */}
            <MapCentering center={mapCenter} zoom={mapZoom} />

            {/* Component to handle map clicks */}
            <MapClickEvents
              onSelect={(latlng) => setSelectedLocation(latlng)}
            />

            {/* Marker for user's current location */}
            {currentLocation && (
              <Marker position={currentLocation} opacity={0.7}>
                <Popup>Your Location</Popup>
              </Marker>
            )}

            {/* Draggable marker for selected location */}
            {selectedLocation && (
              <DraggableMarker
                position={selectedLocation}
                setPosition={setSelectedLocation}
              />
            )}
          </MapContainer>

          {/* Find My Location Button */}
          <button
            className={`btn btn-primary btn-circle absolute bottom-4 right-4 z-40 ${
              loadingLocation ? "loading" : ""
            }`}
            onClick={findMyLocation}
            disabled={loadingLocation}
            title="Find My Location"
          >
            {!loadingLocation && <LocateFixed size={20} />}
          </button>
        </div>

        {/* Footer with Actions */}
        <div className="modal-action p-4 m-0 border-t border-base-200">
          <div className="flex-1">
            {selectedLocation && (
              <span className="text-sm text-base-content/70">
                Selected: {selectedLocation.lat.toFixed(6)},{" "}
                {selectedLocation.lng.toFixed(6)}
              </span>
            )}
          </div>
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn btn-neutral"
            onClick={handleConfirm}
            disabled={!selectedLocation}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </dialog>
  );
}
