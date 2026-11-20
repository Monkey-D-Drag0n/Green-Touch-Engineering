import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Calculate zoom level from bounding box
const getZoomFromBounds = (bounds, mapWidth, mapHeight) => {
  const { minLat, minLon, maxLat, maxLon } = bounds;
  const worldWidth = 360;
  const worldHeight = 180;
  const latFraction = (maxLat - minLat) / worldHeight;
  const lonFraction = (maxLon - minLon) / worldWidth;
  const latZoom = Math.log2(mapHeight / 256 / latFraction);
  const lonZoom = Math.log2(mapWidth / 256 / lonFraction);
  return Math.min(latZoom, lonZoom) - 1; // Add some padding
};

// G7RX+MWW Samdariya Gold, Aurrhat, Narendra Nagar, Hari Bhushan Nagar, Rewa, Madhya Pradesh 486001
// Source: OpenStreetMap Nominatim - geocoded from Plus Code G7RX+MWW
const REWA_BOUNDS = {
  minLat: 24.5423515,
  minLon: 81.2997694,
  maxLat: 24.5424515,
  maxLon: 81.2998694,
};

const REWA_CENTER = {
  lat: 24.5424015,
  lng: 81.2998194,
};

const MapAttribution = () => {
  const map = useMap();
  useEffect(() => {
    // Configure attribution - only show required OSM copyright
    map.attributionControl.setPrefix(false);
    map.attributionControl.addAttribution(
      '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>'
    );
  }, [map]);
  return null;
};

export const LocationMap = () => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current.leafletElement;
      // Fit to Rewa bounds with some padding
      map.fitBounds(
        [
          [REWA_BOUNDS.minLat, REWA_BOUNDS.minLon],
          [REWA_BOUNDS.maxLat, REWA_BOUNDS.maxLon],
        ],
        { padding: [20, 20] }
      );
    }
  }, []);

  return (
    <MapContainer
      ref={mapRef}
      center={REWA_CENTER}
      zoom={12}
      scrollWheelZoom={false}
      dragging={!window.matchMedia("(pointer: coarse)").matches}
      touchZoom={true}
      doubleClickZoom={false}
      boxZoom={false}
      keyboard={false}
      attributionControl={true}
      className="osm-map absolute inset-0 h-full w-full border-0"
      data-testid="location-map"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution=""
        maxZoom={19}
        crossOrigin=""
      />
      <MapAttribution />
    </MapContainer>
  );
};

export default LocationMap;