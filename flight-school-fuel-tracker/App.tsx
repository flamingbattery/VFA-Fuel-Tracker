import React, { useState, useEffect, useCallback } from 'react';
import { Aircraft } from './types';
import { getFuelData, updateAircraftFuel } from './services/geminiService';
import AircraftCard from './components/AircraftCard';
import UpdateFuelModal from './components/UpdateFuelModal';

const App: React.FC = () => {
  const [aircraftList, setAircraftList] = useState<Aircraft[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedAircraft, setSelectedAircraft] = useState<Aircraft | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const loadFuelData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getFuelData();
      setAircraftList(data);
    } catch (err) {
      setError('Failed to load fuel data. Please check your API key and refresh.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFuelData();
  }, [loadFuelData]);

  const handleUpdateClick = (aircraft: Aircraft) => {
    setSelectedAircraft(aircraft);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedAircraft(null);
  };

  const handleSaveFuel = async (tailNumber: string, newFuelGallons: number) => {
    setIsSaving(true);
    setError(null);
    try {
      const updatedData = await updateAircraftFuel(tailNumber, newFuelGallons);
      setAircraftList(updatedData);
      handleCloseModal();
    } catch (err) {
      setError('Failed to save fuel update. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center text-center mt-10">
            <svg className="animate-spin h-12 w-12 text-cyan-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="mt-4 text-xl text-gray-300">Syncing with flight logs...</p>
            <p className="text-sm text-gray-500">Please ensure your Gemini API key is configured.</p>
        </div>
      );
    }
    
    if (error) {
        return (
            <div className="text-center mt-10 bg-red-900/50 border border-red-700 p-6 rounded-lg max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold text-red-300">An Error Occurred</h2>
                <p className="text-red-400 mt-2">{error}</p>
                 <button 
                    onClick={loadFuelData}
                    className="mt-4 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                  >
                    Retry
                  </button>
            </div>
        );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
        {aircraftList.map((aircraft) => (
          <AircraftCard 
            key={aircraft.tailNumber} 
            aircraft={aircraft}
            onUpdateClick={handleUpdateClick}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8">
      <header className="text-center mb-8 md:mb-12">
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-wide">
          VFA <span className="text-cyan-400">Fuel Tracker</span>
        </h1>
      </header>
      <main>
        {renderContent()}
      </main>
      <UpdateFuelModal 
        isOpen={isModalOpen}
        aircraft={selectedAircraft}
        onClose={handleCloseModal}
        onSave={handleSaveFuel}
        isSaving={isSaving}
      />
    </div>
  );
};

export default App;