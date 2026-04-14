"use client";

interface GpsMapProps {
  latitude: number;
  longitude: number;
  address?: string | null;
  height?: number;
}

/**
 * Nhúng Google Maps Embed với chấm đỏ tại tọa độ GPS.
 * Dùng Maps Embed API (iframe) — không cần cài thêm package.
 * API key đọc từ NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.
 */
export default function GpsMap({ latitude, longitude, address, height = 220 }: GpsMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    // Fallback: link mở Google Maps nếu chưa cấu hình API key
    const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
    return (
      <div
        className="flex flex-col items-center justify-center bg-gray-100 rounded-lg border border-dashed border-gray-300 text-sm text-gray-500 gap-2"
        style={{ height }}
      >
        <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <span>{latitude.toFixed(6)}, {longitude.toFixed(6)}</span>
        <a href={mapsUrl} target="_blank" rel="noopener noreferrer"
          className="text-blue-600 hover:underline text-xs">
          Mở Google Maps ↗
        </a>
      </div>
    );
  }

  const src =
    `https://www.google.com/maps/embed/v1/place` +
    `?key=${apiKey}` +
    `&q=${latitude},${longitude}` +
    `&zoom=16` +
    `&maptype=roadmap`;

  return (
    <div className="rounded-lg overflow-hidden border border-gray-200" style={{ height }}>
      <iframe
        title={address || `GPS ${latitude},${longitude}`}
        src={src}
        width="100%"
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}
