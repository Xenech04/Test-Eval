import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Trash2, Link, Sparkles, Check } from 'lucide-react';
import { Avatar } from './Avatar';

interface PhotoUploaderProps {
  photoUrl?: string;
  nomPrenom: string;
  onChangePhoto: (url: string | undefined) => void;
  accentColor?: string;
}

export const PRESET_AVATARS = [
  {
    label: 'Homme Corporate',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&auto=format&fit=crop&q=80'
  },
  {
    label: 'Femme Dynamique',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=256&auto=format&fit=crop&q=80'
  },
  {
    label: 'Homme Lunettes',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&auto=format&fit=crop&q=80'
  },
  {
    label: 'Femme Executive',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80'
  },
  {
    label: 'Homme Barbe',
    url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=256&auto=format&fit=crop&q=80'
  },
  {
    label: 'Femme Tech',
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=256&auto=format&fit=crop&q=80'
  },
  {
    label: 'Homme Moderne',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80'
  },
  {
    label: 'Femme Souriante',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=256&auto=format&fit=crop&q=80'
  }
];

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photoUrl,
  nomPrenom,
  onChangePhoto,
  accentColor = '#003D5B'
}) => {
  const [activeMode, setActiveMode] = useState<'upload' | 'presets' | 'url'>('upload');
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Resize and compress uploaded image to square avatar (max 256x256)
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }

    // Limit source file size to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Le fichier sélectionné est trop volumineux (maximum 10 Mo).');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          const size = 256;
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            onChangePhoto(e.target?.result as string);
            setIsProcessing(false);
            return;
          }

          // Center-crop to square
          const minDim = Math.min(img.width, img.height);
          const sx = (img.width - minDim) / 2;
          const sy = (img.height - minDim) / 2;

          ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          onChangePhoto(dataUrl);
        } catch {
          // Fallback to original data URL if canvas fails
          onChangePhoto(e.target?.result as string);
        } finally {
          setIsProcessing(false);
        }
      };
      img.onerror = () => {
        setErrorMessage('Impossible de charger cette image.');
        setIsProcessing(false);
      };
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
      setErrorMessage('Erreur lors de la lecture du fichier.');
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleApplyCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrlInput.trim()) return;
    onChangePhoto(customUrlInput.trim());
    setCustomUrlInput('');
  };

  return (
    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
          <span>Photo du collaborateur</span>
        </label>

        {photoUrl && (
          <button
            type="button"
            onClick={() => onChangePhoto(undefined)}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Supprimer la photo</span>
          </button>
        )}
      </div>

      {/* Preview and Upload Controls Row */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Current Avatar Preview */}
        <div className="relative group shrink-0">
          <Avatar
            photoUrl={photoUrl}
            nomPrenom={nomPrenom || 'Nouveau Manager'}
            size="xl"
            border
            className="ring-4 ring-white shadow-md"
          />
          {photoUrl && (
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 shadow-xs ring-2 ring-white">
              <Check className="w-3 h-3" />
            </div>
          )}
        </div>

        {/* Source Mode Tabs */}
        <div className="flex-1 w-full space-y-2.5">
          <div className="flex items-center gap-1.5 p-1 bg-slate-200/60 rounded-xl w-fit">
            <button
              type="button"
              onClick={() => setActiveMode('upload')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeMode === 'upload' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3 h-3 inline mr-1" />
              Importer
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('presets')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeMode === 'presets' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3 h-3 inline mr-1" />
              Suggestions ({PRESET_AVATARS.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('url')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                activeMode === 'url' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Link className="w-3 h-3 inline mr-1" />
              Lien Web
            </button>
          </div>

          {/* Mode 1: Drag-and-drop & Manual Upload */}
          {activeMode === 'upload' && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileInputChange}
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
              />
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`w-full py-3 px-4 border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-1 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
                    : 'border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50/80'
                }`}
              >
                <Upload className="w-5 h-5 text-slate-400" />
                <div className="text-xs font-semibold text-slate-700">
                  {isProcessing ? (
                    <span className="text-blue-600 font-bold">Optimisation de l'image...</span>
                  ) : (
                    <>
                      <span className="font-bold underline text-blue-700">Cliquez pour choisir</span> ou glissez-déposez
                    </>
                  )}
                </div>
                <p className="text-[10px] text-slate-400">PNG, JPG, WebP (recadrage automatique 256x256)</p>
              </div>
            </div>
          )}

          {/* Mode 2: Presets */}
          {activeMode === 'presets' && (
            <div className="space-y-1.5">
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {PRESET_AVATARS.map((preset, idx) => {
                  const isSelected = photoUrl === preset.url;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onChangePhoto(preset.url)}
                      title={preset.label}
                      className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-transform hover:scale-105 cursor-pointer ${
                        isSelected ? 'border-blue-600 ring-2 ring-blue-400 shadow-md' : 'border-transparent hover:border-slate-300'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-blue-600/30 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white drop-shadow-md" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-slate-500 italic">
                Cliquez sur un avatar pour l'attribuer immédiatement au manager.
              </p>
            </div>
          )}

          {/* Mode 3: Custom URL */}
          {activeMode === 'url' && (
            <div className="flex items-center gap-2">
              <input
                type="url"
                placeholder="https://exemple.com/photo.jpg"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-[#003D5B]"
              />
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                style={{ backgroundColor: accentColor }}
                className="px-3.5 py-2 text-xs font-bold text-white rounded-xl hover:opacity-90 transition-opacity cursor-pointer shrink-0"
              >
                Appliquer
              </button>
            </div>
          )}

          {errorMessage && (
            <p className="text-xs text-rose-600 font-semibold">{errorMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};
