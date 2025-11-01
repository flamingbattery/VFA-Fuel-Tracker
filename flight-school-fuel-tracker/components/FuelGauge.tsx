import React from 'react';

interface FuelGaugeProps {
  percentage: number; // 0 to 100
  colorClass: string;
}

const FuelGauge: React.FC<FuelGaugeProps> = ({ percentage, colorClass }) => {
  const clampedPercentage = Math.max(0, Math.min(100, percentage));
  const angle = (clampedPercentage / 100) * 180 - 90;
  
  // The radius of the gauge arc is 40.
  // The length of the arc (a semi-circle) is PI * radius.
  const arcLength = Math.PI * 40;

  return (
    <div className="relative w-40 h-20">
      <svg viewBox="0 0 100 50" className="w-full h-full">
        {/* Background track for the gauge */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          stroke="currentColor"
          className="text-gray-700"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Foreground (filled) part of the gauge */}
        <path
          d="M 10 50 A 40 40 0 0 1 90 50"
          fill="none"
          className={colorClass}
          strokeWidth="8"
          strokeLinecap="round"
          style={{
            strokeDasharray: arcLength,
            strokeDashoffset: arcLength * (1 - clampedPercentage / 100),
            transition: 'stroke-dashoffset 0.5s ease-out'
          }}
        />
        {/* Needle */}
        <line
          x1="50"
          y1="50"
          x2="50"
          y2="15"
          stroke="currentColor"
          className="text-gray-300"
          strokeWidth="2"
          strokeLinecap="round"
          style={{
            transformOrigin: '50px 50px',
            transform: `rotate(${angle}deg)`,
            transition: 'transform 0.5s ease-out',
          }}
        />
        <circle cx="50" cy="50" r="4" fill="currentColor" className="text-gray-300" />
      </svg>
    </div>
  );
};

export default FuelGauge;