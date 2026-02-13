import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import { Cafe, MapClickEvent } from './types';
import { INITIAL_CAFES, DEFAULT_FEATURES, DEFAULT_FLAVOR } from './constants';
import Sidebar from './components/Sidebar';
import MapContainer from './components/MapContainer';
import CafeForm from './components/CafeForm';

const App: React.FC = () => {
  // State: Initialize safely based on window width
  const [cafes, setCafes] = useState<Cafe[]>([]);
  // Use callback for initial state to avoid flash on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    return typeof window !== 'undefined' ? window.innerWidth >= 768 : true;
  });
  const [selectedCafe, setSelectedCafe] = useState<Cafe | null>(null);
  const [isNewCafe, setIsNewCafe] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load Cafes from LocalStorage
  useEffect(() => {
    const storedCafes = localStorage.getItem('cafe_vibe_records');
    if (storedCafes) {
      try {
        setCafes(JSON.parse(storedCafes));
      } catch (e) {
        console.error("Failed to parse cafes", e);
        setCafes(INITIAL_CAFES);
      }
    } else {
      setCafes(INITIAL_CAFES);
    }
    setIsInitialized(true);
  }, []);

  // Save Cafes to LocalStorage
  useEffect(() => {
    // Only save after initial load to prevent overwriting with empty array
    if (!isInitialized) return;

    try {
      localStorage.setItem('cafe_vibe_records', JSON.stringify(cafes));
    } catch (e) {
      console.error("Failed to save to localStorage", e);
      alert("儲存空間不足，無法儲存更多資料（可能是照片太多）。請嘗試刪除一些舊紀錄。");
    }
  }, [cafes, isInitialized]);

  // Handle Resize for Responsive Sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsSidebarOpen(true);
      } else {
        if (!isSidebarOpen) return; 
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isSidebarOpen]);

  const handleCafeSelect = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    setIsNewCafe(false); // Edit mode
    // On mobile, close sidebar when selecting to see map/form
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleMapMarkerClick = (cafe: Cafe) => {
    setSelectedCafe(cafe);
    setIsNewCafe(false); // Edit mode
  };

  const handleMapRightClick = (coords: MapClickEvent) => {
    const newCafe: Cafe = {
      id: `custom-${Date.now()}`,
      name: '',
      address: '',
      lat: coords.lat,
      lng: coords.lng,
      itemNote: '',
      flavor: { ...DEFAULT_FLAVOR },
      features: { ...DEFAULT_FEATURES },
      createdAt: Date.now(),
      isCustom: true
    };
    setSelectedCafe(newCafe);
    setIsNewCafe(true);
  };

  const handlePlaceSelect = (place: any) => {
     // Convert search result to a cafe draft
     const lat = place.geometry.location.lat();
     const lng = place.geometry.location.lng();
     
     const newCafe: Cafe = {
      id: `place-${place.place_id || Date.now()}`,
      googlePlaceId: place.place_id,
      name: place.name,
      address: place.formatted_address,
      lat: lat,
      lng: lng,
      itemNote: '',
      flavor: { ...DEFAULT_FLAVOR },
      features: { ...DEFAULT_FEATURES },
      createdAt: Date.now(),
      isCustom: false
    };
    setSelectedCafe(newCafe);
    setIsNewCafe(true);
    
    // 在手機上自動關閉側邊欄，讓表單更清楚
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  const handleSaveCafe = (cafe: Cafe) => {
    if (isNewCafe) {
      setCafes(prev => [cafe, ...prev]);
    } else {
      // Update existing
      setCafes(prev => prev.map(c => c.id === cafe.id ? cafe : c));
    }
    setSelectedCafe(null);
    setIsNewCafe(false);
  };

  const handleDeleteCafe = (id: string) => {
    if (window.confirm('確定要刪除這筆紀錄嗎？')) {
      setCafes(prev => prev.filter(c => c.id !== id));
      setSelectedCafe(null);
    }
  };

  const handleShareCafe = async (cafe: Cafe) => {
    // Validate URL: navigator.share throws "Invalid URL" for non-http/https protocols (like about:srcdoc)
    let safeUrl = '';
    try {
      const currentUrl = new URL(window.location.href);
      if (['http:', 'https:'].includes(currentUrl.protocol)) {
        safeUrl = window.location.href;
      }
    } catch (e) {
      // Invalid URL or non-browser environment
      safeUrl = '';
    }

    const shareData: any = {
      title: `CafeVibe: ${cafe.name}`,
      text: `☕ ${cafe.name}\n📍 ${cafe.address}\n📝 ${cafe.itemNote || '無備註'}\n\n#CafeVibe #台灣跑咖`,
    };

    if (safeUrl) {
      shareData.url = safeUrl;
    }

    try {
      // Use Native Share API if available (Mobile usually)
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        throw new Error('Share API not supported');
      }
    } catch (err: any) {
      // Ignore AbortError (user canceled the share sheet)
      if (err.name === 'AbortError') {
        console.log('Share canceled by user');
        return;
      }

      console.error('Sharing failed (falling back to clipboard):', err);
      // Fallback: Copy to clipboard
      try {
        const textToCopy = `${shareData.text}${safeUrl ? `\n\n${safeUrl}` : ''}`;
        await navigator.clipboard.writeText(textToCopy);
        alert('已複製咖啡廳資訊到剪貼簿！');
      } catch (clipboardErr) {
        alert('無法分享：瀏覽器不支援或拒絕權限。請手動複製。');
      }
    }
  };

  return (
    <>
    <div className="app-container">
      {/* Mobile Overlay: Dims map when sidebar is open */}
      <div 
        className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} 
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar 
        cafes={cafes} 
        onSelectCafe={handleCafeSelect}
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Content */}
      <div className="main-content">
        <button 
          className="btn-toggle"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="icon-md" />
        </button>

        <MapContainer 
          cafes={cafes}
          onMarkerClick={handleMapMarkerClick}
          onMapRightClick={handleMapRightClick}
          onPlaceSelect={handlePlaceSelect}
          selectedCafeId={selectedCafe?.id}
        />
      </div>
    </div>

    {/* Edit/View Panel — rendered OUTSIDE app-container to avoid overflow:hidden blocking clicks */}
    {selectedCafe && (
      <div className="form-panel">
        <CafeForm 
          cafe={selectedCafe}
          onSave={handleSaveCafe}
          onDelete={handleDeleteCafe}
          onShare={handleShareCafe}
          onClose={() => setSelectedCafe(null)}
          isNew={isNewCafe}
        />
      </div>
    )}
    </>
  );
};

export default App;