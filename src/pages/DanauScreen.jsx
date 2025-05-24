import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { GameContext } from '../contexts/GameContext.jsx';
import StatusBar from '../components/StatusBar.jsx';
import InfoBar from '../components/InfoBar.jsx';
import Player from '../components/Player.jsx';
import Map from '../components/Map.jsx';
import ArrowControls from '../components/ArrowControls.jsx';
import ScreenTransition from '../components/ScreenTransition.jsx';
import ActionButton from '../components/ActionButton.jsx'; // Reusable ActionButton

// Define interaction areas for Danau
// Coordinates and sizes are placeholders based on original CSS. Adjust these pixel values precisely.
const INTERACTION_AREAS_DANAU = [
    // Original CSS: #bar-area width: 220px; height: 100px; bottom: 300px; left: 780px;
    { id: 'bar', name: 'Soda Bar', rect: { x: 780, y: window.innerHeight - 300 - 100, width: 220, height: 100 }, text: "Beli Soda (Rp 30)", cost: 30, effects: [{ stat: 'hunger', delta: 15 }, { stat: 'happiness', delta: 3 }], locationText: "Beli soda di Danau" }, //
    // Original CSS: #coconut-area width: 250px; height: 200px; top: 300px; right: 250px;
    { id: 'jetski', name: 'Jetski Rental', rect: { x: window.innerWidth - 250 - 250, y: 300, width: 250, height: 200 }, text: "Sewa Jetski (Rp 150)", cost: 150, effects: [{ stat: 'happiness', delta: 20 }, {stat: 'energy', delta: -10}], locationText: "Naik Jetski" }, //
    // Original CSS: #volleyball-area width: 345px; height: 130px; bottom: 100px; left: 320px;
    { id: 'fishing', name: 'Fishing Spot', rect: { x: 320, y: window.innerHeight - 100 - 130, width: 345, height: 130 }, text: "Mancing (Dapat Rp 200)", cost: -200, effects: [{ stat: 'happiness', delta: 8 }, { stat: 'energy', delta: -5 }], locationText: "Mancing di Danau" }, //
    // Assuming a swimming area similar to pantai, not explicitly in danau.html's specific areas but implied by background
    { id: 'swim_danau', name: 'Lake Swimming', rect: { x: 500, y: 500, width: 400, height: 200 }, text: "Berenang di Danau", cost: 0, effects: [{ stat: 'happiness', delta: 5 }, { stat: 'energy', delta: -2 }, { stat: 'hygiene', delta: 3 }], locationText: "Berenang di Danau" },
];


const DanauScreen = () => {
    const { gameState, dispatch } = useContext(GameContext);
    const [playerPosition, setPlayerPosition] = useState(null);
    const [currentInteractable, setCurrentInteractable] = useState(null);
    const transitionGelapRef = useRef(null);

    useEffect(() => {
        dispatch({ type: 'SET_LOCATION', payload: 'Danau' });
    }, [dispatch]);

    const handlePlayerPositionChange = useCallback((newPosition) => {
        setPlayerPosition(newPosition);
    }, []);

    useEffect(() => {
        if (!playerPosition) return;
        let foundInteractable = null;
        for (const area of INTERACTION_AREAS_DANAU) {
            const playerRect = { /* ... player position ... */
                left: playerPosition.x,
                top: playerPosition.y,
                right: playerPosition.x + playerPosition.width,
                bottom: playerPosition.y + playerPosition.height,
            };
            if (
                playerRect.left < area.rect.right &&
                playerRect.right > area.rect.left &&
                playerRect.top < area.rect.bottom &&
                playerRect.bottom > area.rect.top
            ) {
                foundInteractable = area;
                break;
            }
        }
        setCurrentInteractable(foundInteractable);
    }, [playerPosition]);

    const handleInteraction = () => {
        if (!currentInteractable) return;
        const { cost, effects, locationText } = currentInteractable;

        if (cost > 0 && gameState.money < cost) { // only check money if it's a cost, not an earning
            alert("Uang tidak cukup!");
            return;
        }

        dispatch({ type: 'UPDATE_MONEY', amount: -cost }); // cost can be negative (earning)
        
        if (effects) {
            effects.forEach(effect => {
                dispatch({ type: 'UPDATE_STATUS_DELTA', stat: effect.stat, delta: effect.delta });
            });
        }
        dispatch({ type: 'UPDATE_INFO_BAR_LOCATION', payload: `Lokasi: ${locationText}` }); //
        setCurrentInteractable(null);
    };

    const danauBounds = { minX: 50, maxX: window.innerWidth - 250, minY: 360, maxY: window.innerHeight - 100 }; // (player boundaries from original JS)
    // Original JS in danau.html: areaMinX = 600; areaMaxX = 1300; areaMinY = 400; areaMaxY = 360; (max Y seems like a typo, should be higher or minY lower)
    // The bounds above are illustrative based on the interaction area placements. Adjust these.

    const showTransitionGelap = () => { /* ... same as other screens ... */
        if (transitionGelapRef.current) {
            transitionGelapRef.current.classList.add('opacity-100', 'pointer-events-auto');
            transitionGelapRef.current.classList.remove('opacity-0', 'pointer-events-none');
        }
    };


    return (
        <ScreenTransition>
            <div className="relative w-screen h-screen overflow-hidden bg-[url('/images/gambar/danau.png')] bg-cover bg-center font-utama"> {/* */}
                <div ref={transitionGelapRef} className="fixed top-0 left-0 w-full h-full bg-black opacity-0 pointer-events-none transition-opacity duration-500 ease-in-out z-[999]"></div>
                <div id="arena-top" className="fixed top-0 left-0 w-full z-[100]">
                    <StatusBar />
                    <InfoBar />
                </div>
                <Player
                    initialX={700} initialY={400} // Adjust spawn point for Danau, from original danau.html: posX = 1300; posY = 400;
                    bounds={danauBounds}
                    onPositionChange={handlePlayerPositionChange}
                    spriteWidth={100} spriteHeight={150}
                />
                {currentInteractable && playerPosition && (
                    <ActionButton
                        text={currentInteractable.text}
                        onClick={handleInteraction}
                        style={{
                            left: `${playerPosition.x + playerPosition.width / 2 - 70}px`,
                            top: `${playerPosition.y - 50}px`,
                        }}
                    />
                )}
                {/* Debugging visuals */}
                {/* {INTERACTION_AREAS_DANAU.map(area => (
                    <div key={area.id} className={`absolute border-2 ${currentInteractable?.id === area.id ? 'border-yellow-400 bg-yellow-400 bg-opacity-30' : 'border-blue-500 hover:border-yellow-300 hover:bg-yellow-500 hover:bg-opacity-20'}`}
                        style={{ left: `${area.rect.x}px`, top: `${area.rect.y}px`, width: `${area.rect.width}px`, height: `${area.rect.height}px` }}>
                        <span className="text-white bg-black p-1 text-xs">{area.name}</span>
                    </div>
                ))} */}
                <Map onNavigateStart={showTransitionGelap} />
                <ArrowControls />
            </div>
        </ScreenTransition>
    );
};

export default DanauScreen;