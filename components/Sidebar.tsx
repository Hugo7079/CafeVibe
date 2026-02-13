import React, { useMemo, useState } from 'react';
import { Cafe } from '../types';
import { Search, MapPin } from 'lucide-react';

interface SidebarProps {
  cafes: Cafe[];
  onSelectCafe: (cafe: Cafe) => void;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ cafes, onSelectCafe, isOpen }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCafes = useMemo(() => {
    return cafes.filter(c => 
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      c.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.features.hasSocket && searchTerm.includes('插座')
    ).sort((a, b) => b.createdAt - a.createdAt);
  }, [cafes, searchTerm]);

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <h1 className="text-2xl font-bold">跑咖</h1>
        <p className="text-xs" style={{ opacity: 0.6 }}>台灣跑咖私人地圖</p>
        
        <div className="search-input-wrapper">
          <Search className="search-icon icon-sm" />
          <input 
            type="text" 
            placeholder="搜尋已存咖啡廳..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="sidebar-search-input"
          />
        </div>
      </div>

      <div className="sidebar-list">
        {filteredCafes.length === 0 ? (
          <div className="text-center" style={{ padding: '2.5rem 0', opacity: 0.5 }}>
            <p className="text-sm">還沒有紀錄</p>
            <p className="text-xs" style={{ marginTop: '0.25rem' }}>在地圖上長按或搜尋來新增</p>
          </div>
        ) : (
          filteredCafes.map(cafe => (
            <div 
              key={cafe.id} 
              onClick={() => onSelectCafe(cafe)}
              className="cafe-card"
            >
              <h3 className="text-xl font-bold">{cafe.name}</h3>
              <p className="text-xs truncate" style={{ opacity: 0.6, marginTop: '0.25rem', display: 'flex', alignItems: 'center' }}>
                <MapPin className="icon-sm" style={{ marginRight: '0.25rem' }} />
                {cafe.address}
              </p>
              
              <div style={{ marginTop: '0.75rem', display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                {cafe.features.hasSocket && <span className="tag tag-default">插座</span>}
                {cafe.features.unlimitedTime && <span className="tag tag-default">不限時</span>}
                {cafe.features.hasCat && <span className="tag tag-orange">有貓</span>}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="sidebar-footer">
        共收藏 {cafes.length} 間咖啡廳
      </div>
    </div>
  );
};

export default Sidebar;