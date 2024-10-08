// FloatingPointsAnimation.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface FloatingPointsAnimationProps {
  points: number;
  x: number;
  y: number;
}

const FloatingPointsAnimation: React.FC<FloatingPointsAnimationProps> = ({ points, x, y }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 3000); // Hide after 2 seconds
    return () => clearTimeout(timer);
  }, []);

  return isVisible ? (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: -100 }}
      transition={{ duration: 5 }}
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        color: 'text-black dark:text-white',
        fontSize: '20px',
        fontWeight: 'bold',
        zIndex: '20'
      }}
    >
      +{points}
    </motion.div>
  ) : null;
};

export default FloatingPointsAnimation;

