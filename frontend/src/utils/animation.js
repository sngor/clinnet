// src/utils/animation.js
/**
 * Animation utilities for Clinnet EMR
 * This file provides common animations and transitions for a smoother UI experience
 */

import { keyframes } from '@mui/system';

// Keyframes for various animations
export const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const scaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

export const slideInFromRight = keyframes`
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

export const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

// Animation style objects that can be spread into MUI sx prop
export const animationStyles = {
  fadeIn: {
    animation: `${fadeIn} 0.5s ease forwards`,
  },
  scaleIn: {
    animation: `${scaleIn} 0.4s ease forwards`,
  },
  slideIn: {
    animation: `${slideInFromRight} 0.4s ease forwards`,
  },
  staggeredChildren: (delay = 0.1) => ({
    '& > *': {
      opacity: 0,
      animation: `${fadeIn} 0.5s ease forwards`,
    },
    '& > *:nth-of-type(1)': { animationDelay: `${delay * 1}s` },
    '& > *:nth-of-type(2)': { animationDelay: `${delay * 2}s` },
    '& > *:nth-of-type(3)': { animationDelay: `${delay * 3}s` },
    '& > *:nth-of-type(4)': { animationDelay: `${delay * 4}s` },
    '& > *:nth-of-type(5)': { animationDelay: `${delay * 5}s` },
    '& > *:nth-of-type(6)': { animationDelay: `${delay * 6}s` },
  }),
  pulseAnimation: {
    animation: `${pulse} 2s infinite ease-in-out`,
  },
  hoverLift: {
    transition: 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 25px rgba(67, 97, 238, 0.15)',
    },
  }
};

// Motion variants for framer-motion if used
export const motionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2 }
  }
};

// Staggered container for children
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

// Export a helper function to apply delay to animations
export const withDelay = (animation, delay) => ({
  ...animation,
  animationDelay: `${delay}s`,
});
