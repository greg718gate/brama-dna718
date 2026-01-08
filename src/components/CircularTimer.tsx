import { useEffect, useState } from "react";

interface CircularTimerProps {
  totalSeconds: number;
  remainingSeconds: number;
  isActive: boolean;
  isComplete: boolean;
  size?: number;
}

export const CircularTimer = ({
  totalSeconds,
  remainingSeconds,
  isActive,
  isComplete,
  size = 200
}: CircularTimerProps) => {
  const [pulse, setPulse] = useState(false);
  
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100;
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  
  const mins = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;
  const timeString = `${mins}:${secs.toString().padStart(2, '0')}`;

  useEffect(() => {
    if (isActive) {
      const interval = setInterval(() => {
        setPulse(p => !p);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isActive]);

  const getColors = () => {
    if (isComplete) {
      return {
        primary: "#ffd700",
        secondary: "rgba(255, 215, 0, 0.3)",
        glow: "0 0 30px rgba(255, 215, 0, 0.6)"
      };
    }
    if (isActive) {
      return {
        primary: "#00f2ff",
        secondary: "rgba(0, 242, 255, 0.2)",
        glow: "0 0 20px rgba(0, 242, 255, 0.5)"
      };
    }
    return {
      primary: "#666",
      secondary: "rgba(100, 100, 100, 0.2)",
      glow: "none"
    };
  };

  const colors = getColors();

  return (
    <div 
      className="relative flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      {/* Background glow */}
      {(isActive || isComplete) && (
        <div 
          className="absolute inset-0 rounded-full animate-pulse"
          style={{
            background: `radial-gradient(circle, ${colors.secondary} 0%, transparent 70%)`
          }}
        />
      )}
      
      {/* SVG Circle */}
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: isActive || isComplete ? `drop-shadow(${colors.glow})` : 'none' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(100, 100, 100, 0.2)"
          strokeWidth="8"
        />
        
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.primary}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-1000 ease-linear"
        />
        
        {/* Decorative dots */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30 - 90) * (Math.PI / 180);
          const x = size / 2 + (radius + 12) * Math.cos(angle);
          const y = size / 2 + (radius + 12) * Math.sin(angle);
          const isHighlighted = progress >= (i / 12) * 100;
          
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r={2}
              fill={isHighlighted ? colors.primary : "rgba(100, 100, 100, 0.3)"}
              className={isHighlighted && isActive ? "animate-pulse" : ""}
            />
          );
        })}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div 
          className={`text-4xl font-mono font-bold transition-all ${pulse && isActive ? 'scale-105' : 'scale-100'}`}
          style={{ color: colors.primary }}
        >
          {timeString}
        </div>
        
        {isComplete && (
          <div className="text-[#ffd700] text-sm mt-2 animate-fade-in">
            ✨ Zakończono
          </div>
        )}
        
        {isActive && (
          <div className="text-[#00f2ff] text-xs mt-2 animate-pulse">
            718 Hz aktywne
          </div>
        )}
        
        {!isActive && !isComplete && remainingSeconds === totalSeconds && (
          <div className="text-gray-500 text-xs mt-2">
            Gotowy
          </div>
        )}
      </div>
      
      {/* Sacred geometry overlay */}
      {(isActive || isComplete) && (
        <svg
          width={size}
          height={size}
          className="absolute inset-0 opacity-20"
          style={{ pointerEvents: 'none' }}
        >
          {/* Inner triangle (pointing up) */}
          <polygon
            points={`${size/2},${size*0.2} ${size*0.25},${size*0.7} ${size*0.75},${size*0.7}`}
            fill="none"
            stroke={colors.primary}
            strokeWidth="1"
          />
          {/* Inner triangle (pointing down) */}
          <polygon
            points={`${size/2},${size*0.8} ${size*0.25},${size*0.3} ${size*0.75},${size*0.3}`}
            fill="none"
            stroke={colors.primary}
            strokeWidth="1"
          />
        </svg>
      )}
    </div>
  );
};
