import React, { useState, useEffect, useRef } from 'react';
import { Cafe, FlavorProfile, SpaceFeatures } from '../types';
import { FEATURE_LABELS } from '../constants';
import FlavorRadar from './FlavorRadar';
import { Save, Trash2, X, Camera, Share2, MapPin, Image as ImageIcon } from 'lucide-react';

interface CafeFormProps {
  cafe: Cafe;
  onSave: (cafe: Cafe) => void;
  onDelete: (id: string) => void;
  onShare: (cafe: Cafe) => void;
  onClose: () => void;
  isNew: boolean;
}

const CafeForm: React.FC<CafeFormProps> = ({ cafe, onSave, onDelete, onShare, onClose, isNew }) => {
  const [formData, setFormData] = useState<Cafe>(cafe);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingImg, setIsProcessingImg] = useState(false);

  useEffect(() => {
    setFormData(cafe);
  }, [cafe]);

  const handleFlavorChange = (key: keyof FlavorProfile, value: number) => {
    setFormData(prev => ({
      ...prev,
      flavor: { ...prev.flavor, [key]: value }
    }));
  };

  const handleFeatureToggle = (key: keyof SpaceFeatures) => {
    setFormData(prev => ({
      ...prev,
      features: { ...prev.features, [key]: !prev.features[key] }
    }));
  };

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImg(true);
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Compress image to max 800px width/height to save LocalStorage space
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        const maxSize = 800;

        if (width > height) {
          if (width > maxSize) {
            height *= maxSize / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width *= maxSize / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Convert to Base64 JPEG
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setFormData(prev => ({ ...prev, photoUrl: dataUrl }));
        setIsProcessingImg(false);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setFormData(prev => ({ ...prev, photoUrl: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = ''; 
  };

  // Simplified handlers to ensure standard click behavior works on all devices
  const handleSaveClick = () => {
    onSave(formData);
  };

  const handleDeleteClick = () => {
    onDelete(formData.id);
  };

  const handleShareClick = () => {
    onShare(formData);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden" style={{ height: '100%' }}>
      {/* Header */}
      <div className="form-header">
        <h2 className="text-xl font-bold">{isNew ? '新增紀錄' : '編輯筆記'}</h2>
        <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.5rem', border: 'none' }}>
          <X className="icon-md" />
        </button>
      </div>

      <div className="form-body">
        {/* Basic Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label className="text-xs font-bold" style={{ color: '#888' }}>店名</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="form-input"
              placeholder="輸入店名..."
            />
          </div>
          <div>
             <label className="text-xs font-bold" style={{ color: '#888' }}>地址</label>
            <div style={{ position: 'relative' }}>
              <MapPin className="icon-sm" style={{ position: 'absolute', left: '10px', top: '12px', color: '#888' }} />
              <input
                type="text"
                value={formData.address}
                onChange={e => setFormData({ ...formData, address: e.target.value })}
                className="form-input"
                style={{ paddingLeft: '2.5rem' }}
                placeholder="地址..."
              />
            </div>
          </div>
        </div>

        {/* Notes & Price */}
        <div style={{ marginTop: '1.5rem' }}>
          <label className="text-xs font-bold" style={{ color: '#888' }}>品項與價格紀錄</label>
          <textarea
            value={formData.itemNote}
            onChange={e => setFormData({ ...formData, itemNote: e.target.value })}
            className="form-input"
            style={{ minHeight: '80px', resize: 'vertical' }}
            placeholder="例如：手沖耶加雪菲 $220，肉桂捲 $120..."
          />
        </div>

        {/* Flavor Profile */}
        <div style={{ marginTop: '1.5rem', background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #eee' }}>
          <label className="text-center block text-xs font-bold" style={{ marginBottom: '0.5rem', color: '#5D4037' }}>風味雷達</label>
          <FlavorRadar flavor={formData.flavor} />
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            {(Object.keys(formData.flavor) as Array<keyof FlavorProfile>).map(key => (
              <div key={key}>
                <div className="flex justify-between text-xs" style={{ marginBottom: '0.25rem' }}>
                  <span>{key === 'acidity' ? '酸度' : key === 'bitterness' ? '苦味' : key === 'roast' ? '焙度' : '甜感'}</span>
                  <span>{formData.flavor[key]}/5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.5"
                  value={formData.flavor[key]}
                  onChange={e => handleFlavorChange(key, parseFloat(e.target.value))}
                  style={{ width: '100%', accentColor: '#5D4037' }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Space Features */}
        <div style={{ marginTop: '1.5rem' }}>
          <label className="text-xs font-bold" style={{ color: '#888' }}>空間特色</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
            {(Object.keys(formData.features) as Array<keyof SpaceFeatures>).map(key => (
              <button
                type="button"
                key={key}
                onClick={() => handleFeatureToggle(key)}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '99px',
                  border: formData.features[key] ? '1px solid #5D4037' : '1px solid #ddd',
                  background: formData.features[key] ? '#5D4037' : 'white',
                  color: formData.features[key] ? 'white' : '#666',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {FEATURE_LABELS[key]}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Upload Section */}
        <div style={{ marginTop: '1.5rem' }}>
           <label className="text-xs font-bold" style={{ color: '#888' }}>現場照片</label>
           <input 
             type="file" 
             ref={fileInputRef} 
             accept="image/*" 
             style={{ display: 'none' }} 
             onChange={handleFileChange}
           />
           
           {formData.photoUrl ? (
             <div style={{ position: 'relative', marginTop: '0.5rem' }}>
               <img 
                 src={formData.photoUrl} 
                 alt="Cafe" 
                 style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '12px' }} 
               />
               <button 
                 type="button"
                 onClick={handleRemovePhoto}
                 style={{
                   position: 'absolute', top: '8px', right: '8px',
                   background: 'rgba(0,0,0,0.6)', color: 'white',
                   border: 'none', borderRadius: '50%', width: '32px', height: '32px',
                   display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                 }}
               >
                 <X size={16} />
               </button>
             </div>
           ) : (
             <div 
               onClick={handlePhotoClick}
               style={{ 
                 marginTop: '0.5rem', 
                 border: '2px dashed #ccc', 
                 borderRadius: '12px', 
                 height: '120px', 
                 display: 'flex', 
                 flexDirection: 'column', 
                 alignItems: 'center', 
                 justifyContent: 'center',
                 color: '#888',
                 cursor: 'pointer',
                 backgroundColor: '#fafafa'
               }}
             >
               {isProcessingImg ? (
                 <span>處理中...</span>
               ) : (
                 <>
                   <Camera className="icon-md" style={{ marginBottom: '0.5rem' }} />
                   <span className="text-xs">點擊上傳照片</span>
                 </>
               )}
             </div>
           )}
        </div>

      </div>

      {/* Footer Actions */}
      <div className="form-footer">
         {!isNew && (
          <>
            <button type="button" onClick={handleShareClick} className="btn-secondary" title="分享">
              <Share2 className="icon-md" />
            </button>
            <button type="button" onClick={handleDeleteClick} className="btn-secondary" style={{ color: '#ef4444', borderColor: '#fee2e2' }} title="刪除">
              <Trash2 className="icon-md" />
            </button>
          </>
         )}
         <button type="button" onClick={handleSaveClick} className="btn-primary">
            <Save className="icon-md" />
            {isNew ? '加入地圖' : '儲存變更'}
         </button>
      </div>
    </div>
  );
};

export default CafeForm;