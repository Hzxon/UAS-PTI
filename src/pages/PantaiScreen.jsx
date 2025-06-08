import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { GameContext } from '../contexts/GameContext.jsx';
import StatusBar from '../components/StatusBar.jsx';
import InfoBar from '../components/InfoBar.jsx';
import Player from '../components/Player.jsx';
import Map from '../components/Map.jsx';
import ArrowControls from '../components/ArrowControls.jsx';
import ScreenTransition from '../components/ScreenTransition.jsx';

// Define interaction areas for Pantai
// x,y are top-left coordinates, width, height are dimensions.
// These need to be pixel values corresponding to your background image.
// It's better to define these based on image dimensions if possible.
const INTERACTION_AREAS_PANTAI = [
    // These coordinates and sizes are placeholders. You MUST adjust them to fit your actual background image and player size.
    // The original CSS used absolute positioning and dimensions for these in pixels or percentages.
    { id: 'sea', name: 'Sea', rect: { x: 900, y: 450, width: 410, height: 320 }, text: "Berenang", cost: 0, effects: [{ stat: 'happiness', delta: 5 }, { stat: 'energy', delta: -2 }, { stat: 'hygiene', delta: 3 }], locationText: "Berenang di Laut" }, //
    { id: 'bar', name: 'Bar', rect: { x: 70, y: 100, width: 350, height: 250 }, text: "Makan (Rp 100)", cost: 100, effects: [{ stat: 'hunger', delta: 15 }, { stat: 'happiness', delta: 3 }], locationText: "Makan di Bar" }, //
    { id: 'coconut', name: 'Coconut Tree', rect: { x: 700, y: 100, width: 250, height: 350 }, text: "Minum Kelapa (Rp 30)", cost: 30, effects: [{ stat: 'hunger', delta: 5 }, { stat: 'happiness', delta: 2 }], locationText: "Minum Kelapa" }, //
    { id: 'volleyball', name: 'Volleyball Net', rect: { x: 180, y: 500, width: 345, height: 150 }, text: "Main Voli", cost: 0, effects: [{ stat: 'happiness', delta: 8 }, { stat: 'energy', delta: -5 }], locationText: "Bermain Voli" }, //
];

const ActionButton = ({ text, onClick, style }) => (
    <button
        onClick={onClick}
        className="absolute bg-white text-black font-bold py-2 px-4 rounded shadow-lg hover:bg-gray-200 transition transform hover:scale-105 z-[60]" //
        style={style} // For positioning
    >
        {text}
    </button>
);


const PantaiScreen = () => {
    const { gameState, dispatch } = useContext(GameContext);
    const [playerPosition, setPlayerPosition] = useState(null);
    const [currentInteractable, setCurrentInteractable] = useState(null); // Stores the whole area object
    const transitionGelapRef = useRef(null);


    useEffect(() => {
        dispatch({ type: 'SET_LOCATION', payload: 'Pantai' });
    }, [dispatch]);

    const handlePlayerPositionChange = useCallback((newPosition) => {
        setPlayerPosition(newPosition);
    }, []);

    useEffect(() => {
        if (!playerPosition) return;

        let foundInteractable = null;
        for (const area of INTERACTION_AREAS_PANTAI) {
            const playerRect = {
                left: playerPosition.x,
                top: playerPosition.y,
                right: playerPosition.x + playerPosition.width,
                bottom: playerPosition.y + playerPosition.height,
            };
            const areaRect = { // These are absolute pixel values for interaction areas
                left: area.rect.x,
                top: area.rect.y,
                right: area.rect.x + area.rect.width,
                bottom: area.rect.y + area.rect.height,
            };

            if (
                playerRect.left < areaRect.right &&
                playerRect.right > areaRect.left &&
                playerRect.top < areaRect.bottom &&
                playerRect.bottom > areaRect.top
            ) {
                foundInteractable = area;
                break;
            }
        }
        setCurrentInteractable(foundInteractable);

    }, [playerPosition]);

    const handleInteraction = () => {
        if (!currentInteractable) return;

        const { cost, effects, text, locationText } = currentInteractable;

        if (gameState.money < cost) {
            alert("Uang tidak cukup!"); // Or a more integrated UI message
            return;
        }

        if (cost > 0) {
            dispatch({ type: 'UPDATE_MONEY', amount: -cost });
        }
        if (effects) {
            effects.forEach(effect => {
                dispatch({ type: 'UPDATE_STATUS_DELTA', stat: effect.stat, delta: effect.delta });
            });
        }
        dispatch({ type: 'UPDATE_INFO_BAR_LOCATION', payload: `Lokasi: ${locationText}` }); //

        // Potentially hide button after interaction or add cooldown
        setCurrentInteractable(null); // Hide button after action
    };

    // Player movement boundaries for Pantai
    const pantaiBounds = { minX: 0, maxX: window.innerWidth, minY: 80, maxY: window.innerHeight - 20 }; // Example


    const showTransitionGelap = () => {
        if (transitionGelapRef.current) {
            transitionGelapRef.current.classList.add('opacity-100', 'pointer-events-auto');
            transitionGelapRef.current.classList.remove('opacity-0', 'pointer-events-none');
        }
    };

    return (
        <ScreenTransition>
            <div className="relative w-screen h-screen overflow-hidden bg-[url('/images/gambar/pantai2.png')] bg-cover bg-center font-utama"> {/* */}
                <div
                    ref={transitionGelapRef}
                    className="fixed top-0 left-0 w-full h-full bg-black opacity-0 pointer-events-none transition-opacity duration-500 ease-in-out z-[1003]"
                ></div>

                <div id="arena-top" className="fixed top-0 left-0 w-full z-[100]">
                    <StatusBar />
                    <InfoBar />
                </div>

                <Player
                    initialX={100} // Starting X for Pantai
                    initialY={200} // Starting Y for Pantai
                    bounds={pantaiBounds}
                    onPositionChange={handlePlayerPositionChange}
                    spriteWidth={100}
                    spriteHeight={150}
                />

                {/* Action Button for Pantai */}
                {currentInteractable && playerPosition && (
                    <ActionButton
                        text={currentInteractable.text}
                        onClick={handleInteraction}
                        style={{
                            // Position button above player or near the interaction area
                            left: `${playerPosition.x + playerPosition.width / 2 - 50}px`, // Centered above player
                            top: `${playerPosition.y - 50}px`, // Above player
                        }}
                    />
                )}

                {/* For debugging collision areas */}
                {/* {INTERACTION_AREAS_PANTAI.map(area => (
                    <div
                        key={area.id}
                        className={`absolute border-2 ${currentInteractable?.id === area.id ? 'border-yellow-400 bg-yellow-400 bg-opacity-30' : 'border-transparent hover:border-yellow-300 hover:bg-yellow-500 hover:bg-opacity-20'}`}
                        style={{
                            left: `${area.rect.x}px`,
                            top: `${area.rect.y}px`,
                            width: `${area.rect.width}px`,
                            height: `${area.rect.height}px`,
                        }}
                    >
                        <span className="text-white bg-black p-1 text-xs">{area.name}</span>
                    </div>
                ))} */}

                <Map onNavigateStart={showTransitionGelap} />
                <ArrowControls />
            </div>
        </ScreenTransition>
    );
};

export default PantaiScreen;