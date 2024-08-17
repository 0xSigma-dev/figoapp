import React from 'react';
import Image from 'next/image';
import Lottie from 'react-lottie-player';
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

interface AvatarProps {
  avatarId?: number;
  profileImage?: string;
}

const Avatar: React.FC<AvatarProps> = ({ avatarId, profileImage }) => {
  const selectedAvatar = avatars.find((item) => item.id === avatarId);

  if (selectedAvatar) {
    return (
      <Lottie
        loop
        animationData={selectedAvatar.animation}
        play
        style={{
          width: 50,
          height: 50,
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      />
    );
  }

  // Handle cases where profileImage might be null or undefined
  return (
    <Image
      src='/img/boy1.png'
      alt='Avatar'
      width={50}
      height={50}
      className='rounded-full'
      style={{ objectFit: 'cover' }} // Ensures the image fits well
    />
  );
};

export default Avatar;

