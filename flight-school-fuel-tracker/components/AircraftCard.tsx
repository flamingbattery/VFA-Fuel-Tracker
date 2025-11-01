import React from 'react';
import { Aircraft } from '../types';
import FuelGauge from './FuelGauge';
import { AIRCRAFT_MAX_FUEL } from '../constants';

interface AircraftCardProps {
  aircraft: Aircraft;
  onUpdateClick: (aircraft: Aircraft) => void;
}

const AircraftCard: React.FC<AircraftCardProps> = ({ aircraft, onUpdateClick }) => {
  const maxFuel = AIRCRAFT_MAX_FUEL[aircraft.tailNumber] || 50;
  const fuelPercentage = (aircraft.fuelGallons / maxFuel) * 100;

  const getFuelColorClass = () => {
    // Dangerously low (20% or less)
    if (fuelPercentage <= 20) {
      return 'stroke-red-500';
    }
    // Cautionary level (25 gallons or less)
    if (aircraft.fuelGallons <= 25) {
      return 'stroke-orange-500';
    }
    // Good to go
    return 'stroke-green-500';
  };
  
  const formattedTime = new Date(aircraft.lastUpdated).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <button 
      onClick={() => onUpdateClick(aircraft)}
      className="relative w-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl shadow-lg p-6 flex flex-col items-center text-center hover:border-cyan-500 hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900"
    >
      <h3 className="text-2xl md:text-3xl font-black tracking-wider text-cyan-400 mb-4">{aircraft.tailNumber}</h3>
      <FuelGauge percentage={fuelPercentage} colorClass={getFuelColorClass()} />
      <p className="text-3xl font-bold mt-4">
        {Math.round(aircraft.fuelGallons)} <span className="text-lg text-gray-400 font-medium">GAL</span>
      </p>
      <div className="absolute bottom-2 right-3 text-xs text-gray-500 font-medium">
        {formattedTime}
      </div>
    </button>
  );
};

export default AircraftCard;