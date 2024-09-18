import React, { useState, useEffect } from 'react';
import WallpaperModal from '@/components/WallpaperModal';

interface WallpaperManagerProps {
  backgroundImage: string;
  setBackgroundImage: (image: string) => void;
  openWallpaperModal: () => void; // Change this to a function
}

const WallpaperManager: React.FC<WallpaperManagerProps> = ({ backgroundImage, setBackgroundImage, openWallpaperModal }) => {
  const [isWallpaperModalOpen, setIsWallpaperModalOpen] = useState(false);

  const closeWallpaperModal = () => {
    setIsWallpaperModalOpen(false);
  };

  const saveWallpaper = (selectedWallpaper: string) => {
    setBackgroundImage(selectedWallpaper);
  };

  useEffect(() => {
    if (isWallpaperModalOpen) {
      openWallpaperModal(); // Call the function to open the modal
    }
  }, [isWallpaperModalOpen, openWallpaperModal]);

  return (
    <>
      <WallpaperModal
        isOpen={isWallpaperModalOpen}
        onClose={closeWallpaperModal}
        onSave={saveWallpaper}
      />
    </>
  );
};

export default WallpaperManager;




