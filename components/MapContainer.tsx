import React, { useEffect, useRef, useState } from 'react';
import { Cafe, MapClickEvent } from '../types';
import { DEFAULT_CENTER } from '../constants';
import { Search, Loader2, MapPin, Plus } from 'lucide-react';

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
  const userLocationMarkerRef = useRef<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // 1. Initialize Map + Get User Location
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

      map.on('contextmenu', async (e: any) => {
        const lat = e.latlng.lat;
        const lng = e.latlng.lng;
        // Reverse geocode to get address
        let address = '';
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=zh-TW`
          );
          const data = await res.json();
          if (data && data.display_name) {
            // 取得簡潔的台灣地址格式
            const a = data.address || {};
            const parts = [a.road, a.neighbourhood, a.suburb, a.city_district, a.city || a.town || a.county].filter(Boolean);
            address = parts.length > 0 ? parts.join('') : data.display_name.split(',').slice(0, 3).join(',');
          }
        } catch (err) {
          console.warn('Reverse geocode failed:', err);
        }
        onMapRightClick({ lat, lng, address });
      });

      // Get user location and show blue dot + zoom
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;
            setUserLocation({ lat, lng });
            
            // Add blue dot marker for user location
            const userIcon = L.divIcon({
              html: `<div style="width: 16px; height: 16px; background: #2563eb; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(37, 99, 235, 0.6);"></div>`,
              className: 'user-location-marker',
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            });
            
            userLocationMarkerRef.current = L.marker([lat, lng], { icon: userIcon })
              .addTo(map)
              .bindTooltip('我的位置', { direction: 'top', offset: [0, -10], opacity: 0.8 });
            
            // Zoom to user location
            map.setView([lat, lng], 15);
          },
          (error) => {
            console.warn('Geolocation failed:', error);
            // Fallback to default center
            map.setView([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], 14);
          },
          { timeout: 10000, enableHighAccuracy: false }
        );
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

  // 3. Search Handler (OpenStreetMap Nominatim) - 改進台灣地區搜尋
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length < 1) {
        setSearchResults([]);
        return;
      }

      setIsSearching(true);
      try {
        // 改進：自動加上「台灣」和常見行政區縮寫的擴展
        let searchQueries = [searchQuery];
        
        // 如果輸入看起來像區域名稱，加上「台灣」
        if (searchQuery.match(/[市區鎮]/)) {
          searchQueries.push(`${searchQuery} 台灣`);
        }
        
        // 試著搜尋多個變體
        let allResults: SearchResult[] = [];
        
        for (const q of searchQueries) {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=10&addressdetails=1&countrycodes=tw`
            );
            const data = await response.json();
            allResults = allResults.concat(data);
          } catch (e) {
            console.error(`Search for "${q}" failed:`, e);
          }
        }
        
        // 去重（保留距離台灣最近的結果）
        const seen = new Set();
        const uniqueResults = allResults.filter((result: any) => {
          const key = `${parseFloat(result.lat).toFixed(4)}_${parseFloat(result.lon).toFixed(4)}`;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).slice(0, 8);
        
        setSearchResults(uniqueResults);
        setShowResults(true);
      } catch (error) {
        console.error("Search failed", error);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 400); // 縮短延遲時間，提高反應速度

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
        // 直接跳出新增表單，而不只是跳地圖
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
                        style={{
                          padding: '0.75rem 1.25rem',
                          borderBottom: '1px solid #f3f4f6',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: '0.5rem'
                        }}
                    >
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontWeight: 'bold', color: '#5D4037' }}>
                            {result.display_name.split(',')[0]}
                          </div>
                          <div style={{ 
                            fontSize: '0.75rem', 
                            color: '#888', 
                            whiteSpace: 'nowrap', 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            marginTop: '0.25rem'
                          }}>
                            {result.display_name}
                          </div>
                        </div>
                        <div 
                          style={{
                            background: '#5D4037',
                            color: 'white',
                            padding: '0.35rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.75rem',
                            fontWeight: '600',
                            whiteSpace: 'nowrap',
                            flexShrink: 0
                          }}
                        >
                          新增
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>

      {/* 浮動按鈕區域 */}
      <div style={{
        position: 'absolute',
        bottom: '2rem',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        alignItems: 'center'
      }}>
        {/* 快速新增按鈕 */}
        <button
          onClick={async () => {
            if (mapInstanceRef.current) {
              const center = mapInstanceRef.current.getCenter();
              const lat = center.lat;
              const lng = center.lng;
              // Reverse geocode 取得地址
              let address = '';
              try {
                const res = await fetch(
                  `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=zh-TW`
                );
                const data = await res.json();
                if (data && data.display_name) {
                  const a = data.address || {};
                  const parts = [a.road, a.neighbourhood, a.suburb, a.city_district, a.city || a.town || a.county].filter(Boolean);
                  address = parts.length > 0 ? parts.join('') : data.display_name.split(',').slice(0, 3).join(',');
                }
              } catch (err) {
                console.warn('Reverse geocode failed:', err);
              }
              onMapRightClick({ lat, lng, address });
            }
          }}
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: '#5D4037',
            color: 'white',
            border: 'none',
            fontSize: '28px',
            fontWeight: 'bold',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
        >
          +
        </button>
      </div>
      
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MapContainer;