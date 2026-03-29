// src/components/screens/OrderHub/MapWidget.tsx
// Traces to: Scenario §4 Step 3 Block 5, ADR Decision 3
// Uses inline Leaflet via CDN (no npm install needed)
// Renders in an iframe to avoid CSS conflicts with Tailwind

import { useId } from 'react';

interface MapWidgetProps {
  address: string;
  lat?: number;
  lng?: number;
}

// Build a self-contained Leaflet HTML string for the iframe
function buildLeafletHtml(lat: number, lng: number): string {
  return `<!DOCTYPE html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>*{margin:0;padding:0;box-sizing:border-box}html,body,#map{width:100%;height:100%;overflow:hidden}
.leaflet-control-container{display:none}
</style>
</head><body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
var map = L.map('map', {
  center:[${lat},${lng}],
  zoom:15,
  zoomControl:false,
  scrollWheelZoom:false,
  dragging:false,
  doubleClickZoom:false,
  touchZoom:false,
  keyboard:false,
  tap:false
});
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png',{
  attribution:'',
  subdomains:'abcd',
  maxZoom:19
}).addTo(map);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png',{
  attribution:'',
  subdomains:'abcd',
  maxZoom:19,
  opacity:0.8
}).addTo(map);
L.circleMarker([${lat},${lng}],{
  radius:8,
  color:'#ffffff',
  fillColor:'#4a90d9',
  fillOpacity:1,
  weight:2.5
}).addTo(map);
</script>
</body></html>`;
}

export function MapWidget({ address, lat, lng }: MapWidgetProps) {
  const iframeId = useId();
  const hasCoords = lat !== undefined && lng !== undefined;

  return (
    <div className="mx-4 h-[100px] rounded-card relative overflow-hidden shrink-0">
      {hasCoords ? (
        // Live map via Leaflet embedded in sandboxed iframe
        <iframe
          id={iframeId}
          title="Мапа розташування"
          srcDoc={buildLeafletHtml(lat!, lng!)}
          className="absolute inset-0 w-full h-full border-0"
          sandbox="allow-scripts"
          loading="lazy"
        />
      ) : (
        // Fallback gradient placeholder when no coordinates
        <div className="absolute inset-0 bg-gradient-to-br from-[#2d2d31] via-[#232327] to-[#1a1a1e]">
          <svg
            className="absolute inset-0 w-full h-full opacity-10"
            viewBox="0 0 358 100"
            preserveAspectRatio="none"
          >
            <defs>
              <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#ededed" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>
      )}

      {/* Bottom gradient overlay — ensures address chip is readable over the map */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(14,14,15,0.85) 0%, transparent 55%)',
        }}
      />

      {/* Address chip — bottom left, blurred backdrop */}
      <div
        className="absolute bottom-3 left-4 flex items-center gap-2 px-3 py-[6px] pointer-events-none"
        style={{
          background: 'rgba(31,31,34,0.85)',
          backdropFilter: 'blur(8px)',
          borderRadius: '12px',
        }}
      >
        <svg width="9" height="12" viewBox="0 0 9 12" fill="none" className="shrink-0">
          <path
            d="M4.5 0C2.015 0 0 1.99 0 4.444c0 3.334 4.5 7.556 4.5 7.556S9 7.778 9 4.444C9 1.99 6.985 0 4.5 0zm0 6a1.556 1.556 0 1 1 0-3.111A1.556 1.556 0 0 1 4.5 6z"
            fill="#e7e5e8"
          />
        </svg>
        <span
          className="text-[11px] leading-[13.2px] tracking-[0.06px] whitespace-nowrap"
          style={{ fontFamily: 'Inter, sans-serif', fontWeight: 400, color: '#e7e5e8' }}
        >
          {address}
        </span>
      </div>
    </div>
  );
}

