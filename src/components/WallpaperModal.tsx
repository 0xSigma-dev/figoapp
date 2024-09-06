import React, { useState, useEffect } from 'react';

const wallpapers = [
  '/img/wallpaper1.jpg',
  '/img/wallpaper2.jpg',
  '/img/wallpaper3.jpg',
  '/img/wallpaper4.jpg',
  '/img/wallpaper5.jpg',
  '/img/wallpaper6.jpg',
  '/img/wallpaper7.jpg',
  '/img/wallpaper8.jpg',
  '/img/wallpaper9.jpg',
  '/img/wallpaper10.jpg',
  '/img/wallpaper11.jpg',
  '/img/wallpaper12.jpg',
];

// Define types for props
interface WallpaperModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (wallpaper: string) => void;
}

const WallpaperModal: React.FC<WallpaperModalProps> = ({ isOpen, onClose, onSave }) => {
  const [selectedWallpaper, setSelectedWallpaper] = useState('/img/wallpaper1.jpg');

  useEffect(() => {
    const savedWallpaper = localStorage.getItem('chatWallpaper');
    if (savedWallpaper) {
      setSelectedWallpaper(savedWallpaper);
    }
  }, []);

  const handleWallpaperSelect = (wallpaper: string) => {
    setSelectedWallpaper(wallpaper);
  };

  const handleSave = () => {
    localStorage.setItem('chatWallpaper', selectedWallpaper);
    onSave(selectedWallpaper);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-0 top bg-opacity-50 flex justify-end">
      <div className="bg-black w-full h-52 p-4 relative">
        <h2 className="text-left text-lg font-semibold">Set Wallpaper</h2>
        <div className="flex space-x-4 mt-4 overflow-x-auto">
          {wallpapers.map((wallpaper) => (
            <div
              key={wallpaper}
              className={`cursor-pointer border-2 ${
                selectedWallpaper === wallpaper ? 'border-purple-500' : 'border-transparent'
              }`}
              onClick={() => handleWallpaperSelect(wallpaper)}
            >
              <img src={wallpaper} alt="wallpaper" className="w-40 h-24 object-cover" />
            </div>
          ))}
        </div>
        <div className="absolute bottom-4 right-4 flex space-x-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose}>
            Close
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default WallpaperModal;

