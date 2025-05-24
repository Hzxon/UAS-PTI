import React, { useContext } from 'react';
import { GameContext } from '../contexts/GameContext';

const StatusBar = () => {
  const { gameState } = useContext(GameContext);

  const statusItems = [
    { label: '🍽️', value: gameState.hunger, id: 'hunger' },
    { label: '💤', value: gameState.energy, id: 'energy' },
    { label: '😀', value: gameState.happiness, id: 'happiness' },
    { label: '🚿', value: gameState.hygiene, id: 'hygiene' },
  ];

  return (
    <div className="flex justify-around p-2 bg-black bg-opacity-50 text-white font-utama text-sm"> {/* */}
      {statusItems.map(item => (
        <div key={item.id} className="flex items-center">
          <label className="mr-1">{item.label}</label>
          <progress id={item.id} value={item.value} max="100" className="w-20 h-4 mr-1 [&::-webkit-progress-bar]:rounded-lg [&::-webkit-progress-bar]:bg-gray-600 [&::-webkit-progress-value]:rounded-lg [&::-webkit-progress-value]:bg-green-400"></progress> {/* Basic progress styling, adjust as needed */}
          <span>{item.value}%</span>
        </div>
      ))}
    </div>
  );
};
export default StatusBar;