// components/AvatarComponent.tsx
import React from 'react';
import Lottie from 'react-lottie-player';

// Lottie animation imports
import avatar1 from './lottie/avatar1.json';
import avatar2 from './lottie/avatar2.json';
import avatar3 from './lottie/avatar3.json';
import avatar4 from './lottie/avatar4.json';
import avatar5 from './lottie/avatar5.json';
import avatar6 from './lottie/avatar6.json';
import avatar7 from './lottie/avatar7.json';
import avatar8 from './lottie/avatar8.json';
import avatar9 from './lottie/avatar9.json';
import avatar10 from './lottie/avatar10.json';
import avatar11 from './lottie/avatar11.json';
import avatar12 from './lottie/avatar12.json';
import avatar13 from './lottie/avatar13.json';

// Create a mapping of avatar animations
const avatars = [
  { id: 1, animation: avatar1 },
  { id: 2, animation: avatar2 },
  { id: 3, animation: avatar3 },
  { id: 4, animation: avatar4 },
  { id: 5, animation: avatar5 },
  { id: 6, animation: avatar6 },
  { id: 7, animation: avatar7 },
  { id: 8, animation: avatar8 },
  { id: 9, animation: avatar9 },
  { id: 10, animation: avatar10 },
  { id: 11, animation: avatar11 },
  { id: 12, animation: avatar12 },
  { id: 13, animation: avatar13 },
];

interface AvatarComponentProps {
  avatarId: any;
  width?: number;
  height?: number;
  onClick?: () => void;
}

const AvatarComponent: React.FC<AvatarComponentProps> = ({ avatarId, width = 45, height = 45, onClick }) => {
  // Find the corresponding avatar object in the avatars array
  const selectedAvatar = avatars.find((item) => item.id === avatarId);

  return (
    <>
      {selectedAvatar ? (
        <Lottie
          loop
          animationData={selectedAvatar.animation}
          play
          style={{
            width, // Use width prop
            height, // Use height prop
            position: 'relative',
            borderRadius: '50%',
            overflow: 'hidden',
          }}
          onClick={onClick}
        />
      ) : (
        // Fallback if no avatar is found
        <div style={{ width, height, backgroundColor: '#ccc', borderRadius: '50%' }} />
      )}
    </>
  );
};

export default AvatarComponent;
