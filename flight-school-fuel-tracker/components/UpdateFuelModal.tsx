import React, { useState, useEffect } from 'react';
import { Aircraft } from '../types';
import { AIRCRAFT_MAX_FUEL } from '../constants';

interface UpdateFuelModalProps {
  aircraft: Aircraft | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tailNumber: string, newFuelGallons: number) => Promise<void>;
  isSaving: boolean;
}

const UpdateFuelModal: React.FC<UpdateFuelModalProps> = ({ aircraft, isOpen, onClose, onSave, isSaving }) => {
  const [fuelLevel, setFuelLevel] = useState(aircraft?.fuelGallons || 0);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    if (aircraft) {
      setFuelLevel(aircraft.fuelGallons);
      setShowHistory(false); // Reset view when modal opens or aircraft changes
    }
  }, [aircraft]);

  if (!isOpen || !aircraft) {
    return null;
  }

  const maxFuel = AIRCRAFT_MAX_FUEL[aircraft.tailNumber] || 50;

  const handleSave = () => {
    onSave(aircraft.tailNumber, Math.round(Number(fuelLevel)));
  };

  const renderHistory = () => (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700" aria-label="Back to update form">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
        </button>
        <h3 className="text-xl font-bold text-white">Update History</h3>
      </div>
      <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
        {aircraft && aircraft.history.length > 0 ? (
          [...aircraft.history]
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .map((entry, index) => (
            <div key={index} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center animate-fade-in">
              <div>
                <p className="text-sm font-semibold text-white">{new Date(entry.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}</p>
                <p className="text-xs text-gray-400">{new Date(entry.timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}</p>
              </div>
              <p className="font-bold text-lg text-white">{entry.fuelGallons} <span className="text-sm font-medium text-gray-400">GAL</span></p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-8">No recent history available.</p>
        )}
      </div>
       <div className="mt-6">
          <button
            onClick={() => setShowHistory(false)}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            Back to Update
          </button>
        </div>
    </div>
  );

  const renderUpdateForm = () => (
     <>
        <div className="text-center mb-6">
          <p className="text-4xl font-black tracking-wider text-cyan-400">{aircraft.tailNumber}</p>
        </div>
        <div className="space-y-4">
          <div className="text-center">
            <span className="text-5xl font-bold text-white">{Math.round(Number(fuelLevel))}</span>
            <span className="text-xl text-gray-400 ml-2">Gallons</span>
          </div>
          <input
            type="range"
            min="0"
            max={maxFuel}
            step="1"
            value={fuelLevel}
            onChange={(e) => setFuelLevel(parseFloat(e.target.value))}
            className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer range-lg accent-cyan-500"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>0 gal</span>
            <span>{maxFuel} gal</span>
          </div>
        </div>
        <div className="mt-8 flex gap-4">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="w-full bg-gray-600 hover:bg-gray-500 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              'Save Fuel Level'
            )}
          </button>
        </div>
      </>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md border border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">
            {showHistory ? '' : 'Update Fuel'}
          </h2>
          <div className="flex items-center gap-2">
            {!showHistory && (
              <button onClick={() => setShowHistory(true)} title="View History" className="text-gray-400 hover:text-white transition-colors p-1 rounded-full hover:bg-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </button>
            )}
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors" aria-label="Close modal">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {showHistory ? renderHistory() : renderUpdateForm()}
      </div>
    </div>
  );
};

export default UpdateFuelModal;