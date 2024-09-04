import React, { useEffect, useState, memo } from 'react';
import Lottie from 'react-lottie-player';
import Figocoin from './lottie/figocoin.json'; 
import { Bungee_Shade } from 'next/font/google';
const bungeeShade = Bungee_Shade({
    subsets: ['latin'], // You can specify subsets if needed
    weight: '400', // Specify the weight if needed, or leave it out if default
  });

const MemoizedLottie = memo(Lottie);

interface PointsDisplayProps {
  points: number;
}

const PointsDisplay: React.FC<PointsDisplayProps> = ({ points }) => {
  const [animationClass, setAnimationClass] = useState('');
  const [previousPoints, setPreviousPoints] = useState(points);

  useEffect(() => {
    if (points !== previousPoints) {
      setAnimationClass('change');
      const timer = setTimeout(() => {
        setAnimationClass('');
        setPreviousPoints(points);
      }, 500); // Match this duration with your CSS animation duration
      return () => clearTimeout(timer);
    }
  }, [points, previousPoints]);

  const pointsString = points.toString().split('');

  return (
    <div 
      className={`points-container mr-16 mt-6 ${pointsString.length === 1 ? 'single' : 'multi'} ${animationClass}`} 
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '-32px' }} // Flexbox for centering
    >
      <MemoizedLottie
        loop
        animationData={Figocoin}
        play
        style={{
          width: 128,
          height: 128,
          //marginRight: '8px', // Add margin to space between Lottie and points
        }}
      />
      <div style={{ display: 'flex', alignItems: 'center', marginLeft: '-28px' }}> {/* Container for points */}
        {pointsString.map((digit, index) => (
          <span key={index} className={`text-4xl font-bold ${bungeeShade.className}`}>
            {digit}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PointsDisplay;


