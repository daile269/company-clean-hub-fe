"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix default Leaflet marker icon path issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

export interface MapPickerValue {
  latitude: number;
  longitude: number;
}

interface MapPickerProps {
  value?: MapPickerValue | null;
  onChange?: (value: MapPickerValue) => void;
  readonly?: boolean;
  height?: string;
}

// Default center: Vietnam
const DEFAULT_CENTER: [number, number] = [14.0583, 108.2772];
const DEFAULT_ZOOM = 6;

export default function MapPicker({ value, onChange, readonly = false, height = "350px" }: MapPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [selected, setSelected] = useState<MapPickerValue | null>(value ?? null);
  const [initialized, setInitialized] = useState(false);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: value ? [value.latitude, value.longitude] : DEFAULT_CENTER,
      zoom: value ? 15 : DEFAULT_ZOOM,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;
    setInitialized(true);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle value changes
  useEffect(() => {
    if (!mapRef.current || !initialized) return;
    const map = mapRef.current;

    // Remove old marker
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }

    // Add marker if value exists
    if (value) {
      setSelected(value);
      const marker = L.marker([value.latitude, value.longitude], {
        draggable: !readonly,
      }).addTo(map);

      if (!readonly) {
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          const newVal: MapPickerValue = {
            latitude: parseFloat(pos.lat.toFixed(7)),
            longitude: parseFloat(pos.lng.toFixed(7)),
          };
          setSelected(newVal);
          onChange?.(newVal);
        });
      }

      markerRef.current = marker;
      map.setView([value.latitude, value.longitude], map.getZoom());
    } else {
      setSelected(null);
    }
  }, [value, readonly, onChange, initialized]);

  // Handle click on map to place marker (only when not readonly)
  const handleMapClick = useCallback(
    (e: L.LeafletMouseEvent) => {
      if (readonly || !mapRef.current) return;

      const newVal: MapPickerValue = {
        latitude: parseFloat(e.latlng.lat.toFixed(7)),
        longitude: parseFloat(e.latlng.lng.toFixed(7)),
      };
      setSelected(newVal);
      onChange?.(newVal);

      // Update marker
      if (markerRef.current) {
        markerRef.current.setLatLng(e.latlng);
      } else {
        const marker = L.marker(e.latlng, { draggable: true }).addTo(mapRef.current);
        marker.on("dragend", () => {
          const pos = marker.getLatLng();
          const dragged: MapPickerValue = {
            latitude: parseFloat(pos.lat.toFixed(7)),
            longitude: parseFloat(pos.lng.toFixed(7)),
          };
          setSelected(dragged);
          onChange?.(dragged);
        });
        markerRef.current = marker;
      }
    },
    [readonly, onChange],
  );

  // Attach click handler
  useEffect(() => {
    if (!mapRef.current || !initialized) return;
    const map = mapRef.current;
    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [handleMapClick, initialized]);

  // Invalidate size when container becomes visible
  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
    }
  }, []);

  return (
    <div>
      <div
        ref={mapContainerRef}
        style={{ height, width: "100%", borderRadius: "8px" }}
        className="border border-gray-300"
      />
      {selected && (
        <div className="mt-2 flex items-center gap-4 text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
          <span>
            📍 Vĩ độ: <span className="font-mono font-medium text-gray-800">{selected.latitude}</span>
          </span>
          <span>
            📍 Kinh độ: <span className="font-mono font-medium text-gray-800">{selected.longitude}</span>
          </span>
          {!readonly && (
            <span className="text-gray-400">(Click để chọn vị trí, kéo marker để chỉnh)</span>
          )}
        </div>
      )}
      {!selected && !readonly && (
        <p className="mt-2 text-xs text-gray-400 text-center">Click vào bản đồ để chọn vị trí làm việc</p>
      )}
    </div>
  );
}

// Export a static map preview for read-only display (small version)
export function MapPreview({ latitude, longitude, height = "150px" }: { latitude: number; longitude: number; height?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [latitude, longitude],
      zoom: 15,
      scrollWheelZoom: false,
      zoomControl: false,
      dragging: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OSM",
      maxZoom: 19,
    }).addTo(map);

    L.marker([latitude, longitude]).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      setTimeout(() => mapRef.current?.invalidateSize(), 100);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%", borderRadius: "8px" }}
      className="border border-gray-200"
    />
  );
}
