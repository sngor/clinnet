// src/components/AnimatedBackground.jsx
import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';

/**
 * A component that renders an animated gradient background using canvas
 */
function AnimatedBackground({ children, blur = 30 }) {
  const canvasRef = useRef(null);
  const theme = useTheme();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;
    
    // Extract colors from theme
    const primaryColor = theme.palette.primary.main;
    const primaryLight = theme.palette.primary.light;
    const secondaryColor = theme.palette.secondary.main;
    const infoColor = theme.palette.info.main;
    
    // Convert hex to RGB for gradient
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    };
    
    // Create gradient points
    const gradientPoints = [
      { 
        x: width * 0.1, 
        y: height * 0.1, 
        radius: Math.max(width, height) * 0.5,
        color: hexToRgb(primaryColor) || { r: 25, g: 118, b: 210 },
        vx: 0.2,
        vy: 0.1
      },
      { 
        x: width * 0.8, 
        y: height * 0.3, 
        radius: Math.max(width, height) * 0.4,
        color: hexToRgb(primaryLight) || { r: 71, g: 145, b: 219 },
        vx: -0.1,
        vy: 0.2
      },
      { 
        x: width * 0.5, 
        y: height * 0.8, 
        radius: Math.max(width, height) * 0.6,
        color: hexToRgb(secondaryColor) || { r: 220, g: 0, b: 78 },
        vx: -0.05,
        vy: -0.1
      },
      { 
        x: width * 0.2, 
        y: height * 0.6, 
        radius: Math.max(width, height) * 0.3,
        color: hexToRgb(infoColor) || { r: 33, g: 150, b: 243 },
        vx: 0.1,
        vy: -0.15
      }
    ];
    
    // Handle window resize
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      
      // Update gradient points positions on resize
      gradientPoints.forEach(point => {
        if (point.x > width) point.x = width * 0.8;
        if (point.y > height) point.y = height * 0.8;
      });
    };
    
    window.addEventListener('resize', handleResize);
    
    // Animation function
    const animate = () => {
      // Clear canvas with a slight fade effect for smoother transitions
      ctx.fillStyle = 'rgba(245, 247, 250, 0.01)';
      ctx.fillRect(0, 0, width, height);
      
      // Move gradient points
      gradientPoints.forEach(point => {
        point.x += point.vx;
        point.y += point.vy;
        
        // Bounce off edges
        if (point.x < 0 || point.x > width) point.vx *= -1;
        if (point.y < 0 || point.y > height) point.vy *= -1;
      });
      
      // Create radial gradients
      gradientPoints.forEach(point => {
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, point.radius
        );
        
        gradient.addColorStop(0, `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, 0.4)`);
        gradient.addColorStop(1, `rgba(${point.color.r}, ${point.color.g}, ${point.color.b}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      });
      
      animationFrameId = window.requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      window.cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);
  
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden' }}>
      <Box
        component="canvas"
        ref={canvasRef}
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          filter: `blur(${blur}px)`,
          zIndex: -1,
        }}
      />
      {children}
    </Box>
  );
}

export default AnimatedBackground;