import React, { useEffect, useRef, useState } from 'react';
import { Cafe, MapClickEvent } from '../types';
import { DEFAULT_CENTER } from '../constants';
import { Search, Loader2 } from 'lucide-react';

interface MapContainerProps {
  cafes: Cafe[];
  onMarkerClick: (cafe: Cafe) => void;
  onMapRightClick: (coords: MapClickEvent) => void;
  onPlaceSelect: (place: any) => void;
  selectedCafeId?: string;
}

declare global {
  interface Window {
    L: any;
  }
}

interface SearchResult {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
}

const MapContainer: React.FC<MapContainerProps> = ({ 
  cafes, 
  onMarkerClick, 
  onMapRightClick,
  onPlaceSelect,
  selectedCafeId 
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{[id: string]: any}>({});
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // 1. Initialize Map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current && window.L) {
      const L = window.L;
      
      const map = L.map(mapRef.current, {
        center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
        zoom: 14,
        zoomControl: false,
        attributionControl: false
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);
      
      // Using CartoDB Light basemap for that "Minimalist" look
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 20,
        subdomains: 'abcd',
        attribution: '&copy; OpenStreetMap &copy; CARTO'
      }).addTo(map);

      map.on('contextmenu', (e: any) => {
        onMapRightClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      });

      // Simple geolocation to start
      if (navigator.geolocation && cafes.length === 0) {
        navigator.geolocation.getCurrentPosition((pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 15);
        }, () => {}, { timeout: 5000 });
      }

      mapInstanceRef.current = map;
    }
  }, []); // Run once

  // Handle Resize to fix grey map issues when sidebar toggles
  useEffect(() => {
    const handleResize = () => {
        if(mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
        }
    };
    // Helper to delay invalidateSize slightly for CSS transitions
    const timeout = setTimeout(handleResize, 350); 
    window.addEventListener('resize', handleResize);
    return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timeout);
    };
  }, [cafes]); // Simple trigger

  // 2. Manage Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !window.L) return;
    const L = window.L;
    const map = mapInstanceRef.current;

    // Cleanup removed cafes
    Object.keys(markersRef.current).forEach(id => {
      if (!cafes.find(c => c.id === id)) {
        map.removeLayer(markersRef.current[id]);
        delete markersRef.current[id];
      }
    });

    cafes.forEach(cafe => {
      const isSelected = selectedCafeId === cafe.id;
      const color = isSelected ? '#8D6E63' : '#5D4037';
      const scale = isSelected ? 1.3 : 1;
      const zIndex = isSelected ? 1000 : 500;
      
      const svgIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="${color}" stroke="#F5F5DC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="filter: drop-shadow(0px 3px 3px rgba(0,0,0,0.2));">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
          <circle cx="12" cy="10" r="3" fill="#F5F5DC"></circle>
        </svg>
      `;

      const icon = L.divIcon({
        html: svgIcon,
        className: 'custom-marker-icon',
        iconSize: [32 * scale, 32 * scale],
        iconAnchor: [16 * scale, 32 * scale],
        popupAnchor: [0, -32 * scale]
      });

      if (markersRef.current[cafe.id]) {
        markersRef.current[cafe.id].setIcon(icon);
        markersRef.current[cafe.id].setLatLng([cafe.lat, cafe.lng]);
        markersRef.current[cafe.id].setZIndexOffset(zIndex);
        // Re-bind click handler to avoid stale closure
        markersRef.current[cafe.id].off('click');
        markersRef.current[cafe.id].on('click', () => onMarkerClick(cafe));
      } else {
        const marker = L.marker([cafe.lat, cafe.lng], { icon, zIndexOffset: zIndex })
          .addTo(map)
          .on('click', () => onMarkerClick(cafe));
        
        // Add simple tooltip
        marker.bindTooltip(cafe.name, { direction: 'top', offset: [0, -30], opacity: 0.8 });
        
        markersRef.current[cafe.id] = marker;
      }
    });

    if (selectedCafeId && markersRef.current[selectedCafeId]) {
         const cafe = cafes.find(c => c.id === selectedCafeId);
         if(cafe) {
             map.setView([cafe.lat, cafe.lng], 16, { animate: true });
         }
    }

  }, [cafes, selectedCafeId, onMarkerClick]);

  // 3. Search Handler (OpenStreetMap Nominatim)
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // Append '台灣' context
        const q = searchQuery.includes('台灣') ? searchQuery : `${searchQuery} 台灣`;
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5&addressdetails=1`
        );
        const data = await response.json();
        setSearchResults(data);
        setShowResults(true);
      } catch (error) {
        console.error("Search failed", error);
      } finally {
        setIsSearching(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectResult = (result: SearchResult) => {
    if (mapInstanceRef.current) {
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        mapInstanceRef.current.setView([lat, lng], 17);
        
        const place = {
            place_id: result.place_id.toString(),
            name: result.display_name.split(',')[0],
            formatted_address: result.display_name,
            geometry: {
                location: {
                    lat: () => lat,
                    lng: () => lng
                }
            }
        };
        onPlaceSelect(place);
    }
    setSearchQuery('');
    setShowResults(false);
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div className="map-search-container">
        <div className="map-search-box">
             <div style={{ color: '#5D4037', display: 'flex' }}>
                {isSearching ? <Loader2 className="icon-md animate-spin"/> : <Search className="icon-md"/>}
             </div>
             <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowResults(true)}
                placeholder="搜尋路名或咖啡廳..."
                className="map-search-input-field"
             />
        </div>

        {showResults && searchResults.length > 0 && (
            <div className="search-results custom-scrollbar">
                {searchResults.map((result) => (
                    <div 
                        key={result.place_id}
                        onClick={() => handleSelectResult(result)}
                        className="search-item"
                    >
                        <div style={{ fontWeight: 'bold', color: '#5D4037' }}>{result.display_name.split(',')[0]}</div>
                        <div style={{ fontSize: '0.75rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{result.display_name}</div>
                    </div>
                ))}
            </div>
        )}
      </div>
      
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapContainer;