import React, { useState } from 'react';
import { Map, Key, ExternalLink } from 'lucide-react';

interface ApiKeyModalProps {
  onSubmit: (key: string) => void;
}

const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ onSubmit }) => {
  const [key, setKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onSubmit(key.trim());
    }
  };

  return (
    <div className="fixed inset-0 bg-bean/90 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-cream w-full max-w-md rounded-2xl p-8 shadow-2xl border-2 border-bean">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="bg-bean text-cream p-4 rounded-full mb-4">
            <Map className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-bean mb-2">歡迎使用 CafeVibe</h1>
          <p className="text-bean/70 text-sm">
             為了載入真實地圖與搜尋台灣咖啡廳，<br/>我們需要您的 Google Maps API Key。
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Key className="absolute left-3 top-3 w-5 h-5 text-bean/40" />
            <input
              type="text"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="貼上您的 API Key"
              className="w-full bg-white border border-bean/30 rounded-lg py-3 pl-10 pr-4 text-bean focus:outline-none focus:border-bean focus:ring-1 focus:ring-bean"
            />
          </div>
          
          <button
            type="submit"
            disabled={!key}
            className="w-full bg-bean text-cream font-bold py-3 rounded-lg hover:bg-bean-light disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            開始跑咖
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-bean/10 text-center">
          <a 
            href="https://developers.google.com/maps/documentation/javascript/get-api-key" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xs text-bean/60 hover:text-bean flex items-center justify-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            如何取得 API Key?
          </a>
          <p className="text-[10px] text-bean/40 mt-2">
            您的 Key 僅會儲存在本地瀏覽器中，不會傳送至任何伺服器。
            需啟用 Maps JS API 與 Places API。
          </p>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyModal;
