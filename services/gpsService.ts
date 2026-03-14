import { AUTO_CAPTURE_CONFIG } from '../config/autoCaptureConfig';

export interface GpsCoords {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GpsUpdateData {
  status?: string;
  coords?: GpsCoords;
  osmLink?: string;
  primaryAddress?: string;
  nominatimAddress?: string;
  error?: string;
}

export interface GpsCallbacks {
  onUpdate?: (data: GpsUpdateData) => void;
  onDebug?: (message: string) => void;
}

export class GpsService {
  public coords: GpsCoords | null = null;
  public addressPrimary: string | null = null;    // Google or BigDataCloud
  public addressNominatim: string | null = null;  // Nominatim
  public osmMapLink: string | null = null;        // OpenStreetMap viewer link
  public error: string | null = null;
  private lastGeocodeTime: number = 0;
  private onUpdate: (data: GpsUpdateData) => void;
  private onDebug: (message: string) => void;
  private watchId: number | null = null;

  constructor(callbacks: GpsCallbacks = {}) {
    this.onUpdate = callbacks.onUpdate || (() => { });
    this.onDebug = callbacks.onDebug || (() => { });
  }

  startTracking() {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      this.error = 'Trình duyệt không hỗ trợ GPS';
      this.onUpdate({ error: this.error });
      return;
    }

    this.onUpdate({ status: '⏳ Đang tìm tín hiệu GPS...' });

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        };
        this.error = null;
        this.osmMapLink = `https://www.openstreetmap.org/?mlat=${this.coords.latitude}&mlon=${this.coords.longitude}#map=19/${this.coords.latitude}/${this.coords.longitude}`;

        this.onUpdate({
          status: `✅ GPS: ${this.coords.latitude.toFixed(5)}, ${this.coords.longitude.toFixed(5)} (±${Math.round(this.coords.accuracy)}m)`,
          coords: this.coords,
          osmLink: this.osmMapLink
        });

        this.fetchAllAddresses(this.coords.latitude, this.coords.longitude);
      },
      (err) => {
        const errorMap: Record<number, string> = {
          1: 'Bị từ chối quyền vị trí',
          2: 'Không thể xác định vị trí',
          3: 'Hết thời gian chờ (Timeout)'
        };
        this.error = errorMap[err.code] || err.message;
        this.onUpdate({ error: this.error });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  }

  stopTracking() {
    if (this.watchId !== null && typeof window !== 'undefined') {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  async fetchAllAddresses(lat: number, lon: number) {
    const now = Date.now();
    const waitTime = this.addressPrimary ? 60000 : 10000;
    if (now - this.lastGeocodeTime < waitTime) return;

    this.lastGeocodeTime = now;

    // Chạy song song cả Google/BDC và Nominatim
    Promise.all([
      this.fetchPrimaryAddress(lat, lon),
      this.fetchNominatimAddress(lat, lon)
    ]);
  }

  async fetchPrimaryAddress(lat: number, lon: number) {
    if (AUTO_CAPTURE_CONFIG.GOOGLE_MAPS_API_KEY && AUTO_CAPTURE_CONFIG.GOOGLE_MAPS_API_KEY.trim() !== "") {
      return this.fetchGoogleMapsAddress(lat, lon);
    } else {
      return this.fetchBigDataCloudAddress(lat, lon);
    }
  }

  async fetchGoogleMapsAddress(lat: number, lon: number) {
    this.onDebug('⏳ Đang gọi API Google Maps...');
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lon}&key=${AUTO_CAPTURE_CONFIG.GOOGLE_MAPS_API_KEY}&language=vi`;
      const response = await fetch(url);
      const data = await response.json();

      if (data.status === 'OK' && data.results && data.results[0]) {
        this.addressPrimary = data.results[0].formatted_address.replace(', Việt Nam', '').trim();
        this.onUpdate({ primaryAddress: this.addressPrimary || undefined });
      } else {
        throw new Error(`Google Maps Error: ${data.status}`);
      }
    } catch (e) {
      // console.warn('[Google Geocode Error]', e);
      return this.fetchBigDataCloudAddress(lat, lon);
    }
  }

  async fetchBigDataCloudAddress(lat: number, lon: number) {
    this.onDebug('⏳ Đang gọi API BigDataCloud...');
    try {
      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=vi`;
      const response = await fetch(url);
      const data = await response.json();

      if (data && data.localityInfo) {
        const allInfo = [...data.localityInfo.administrative, ...data.localityInfo.informative];
        let ward = "";
        let district = "";
        let city = data.principalSubdivision || data.city || "";

        allInfo.forEach(item => {
          const name = item.name;
          if (!name) return;
          if (name.includes("Phường") || (item.adminLevel === 6 && !ward)) ward = name;
          if (name.includes("Quận") || name.includes("District")) district = name;
        });

        if (!ward) ward = data.locality || "";
        const finalParts = [ward, district, city].filter(p => p.trim() !== "" && p !== "Việt Nam");
        this.addressPrimary = Array.from(new Set(finalParts)).join(', ');
        this.onUpdate({ primaryAddress: this.addressPrimary || undefined });
      }
    } catch (e) {
      // console.warn('[BigDataCloud Error]', e);
    }
  }

  async fetchNominatimAddress(lat: number, lon: number) {
    this.onDebug('⏳ Đang gọi API Nominatim...');
    try {
      const url = `${AUTO_CAPTURE_CONFIG.NOMINATIM_API_URL}?format=jsonv2&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;
      const response = await fetch(url, {
        headers: { 'User-Agent': AUTO_CAPTURE_CONFIG.USER_AGENT }
      });
      const data = await response.json();

      if (data && data.display_name) {
        this.addressNominatim = data.display_name.replace(', Việt Nam', '').trim();
        this.onUpdate({ nominatimAddress: this.addressNominatim || undefined });
      }
    } catch (e) {
      // console.warn('[Nominatim Geocode Error]', e);
    }
  }
}
