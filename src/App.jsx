import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MainMenuScreen from './pages/MainMenuScreen';
import RumahScreen from './pages/RumahScreen';
import GunungScreen from './pages/GunungScreen';
import PantaiScreen from './pages/PantaiScreen';
import DanauScreen from './pages/DanauScreen';
import BilliardScreen from './pages/BilliardScreen';
// You might want a component for screen transitions
// import ScreenTransition from './components/ScreenTransition';

function App() {
  return (
    // <ScreenTransition> // Optional: Wrap Routes for page transitions
      <Routes>
        <Route path="/" element={<MainMenuScreen />} />
        <Route path="/rumah" element={<RumahScreen />} />
        <Route path="/gunung" element={<GunungScreen />} />
        <Route path="/pantai" element={<PantaiScreen />} />
        <Route path="/danau" element={<DanauScreen />} />
        <Route path="/billiard" element={<BilliardScreen />} />
        {/* Define other routes as needed */}
      </Routes>
    // </ScreenTransition>
  );
}

export default App;