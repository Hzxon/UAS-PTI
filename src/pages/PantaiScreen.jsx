import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { GameContext } from '../contexts/GameContext.jsx';
import StatusBar from '../components/StatusBar.jsx';
import InfoBar from '../components/InfoBar.jsx';
import Player from '../components/Player.jsx';
import Map from '../components/Map.jsx';
import ArrowControls from '../components/ArrowControls.jsx';
import ScreenTransition from '../components/ScreenTransition.jsx';
import ActionButton from '../components/ActionButton.jsx';

const INTERACTION_AREAS_PANTAI = [
    {
        id: 'sea',
        name: 'Laut',
        rect: { x: 900, y: 450, width: 410, height: 320 },
        locationText: "Berenang di Laut",
        actions: [
            { 
                text: 'Berenang', 
                cost: 0, 
                effects: [
                    { stat: 'happiness', delta: 5 },
                    { stat: 'energy', delta: -2 },
                    { stat: 'hygiene', delta: 3 }
                ] 
            }
        ]
    },
    {
        id: 'bar',
        name: 'Bar Pantai',
        rect: { x: 70, y: 100, width: 350, height: 250 },
        locationText: "Makan di Bar Pantai",
        actions: [
            { 
                text: 'Makan (Rp 100)', 
                cost: 100, 
                effects: [
                    { stat: 'hunger', delta: 15 },
                    { stat: 'happiness', delta: 3 }
                ] 
            }
        ]
    },
    {
        id: 'coconut',
        name: 'Pohon Kelapa',
        rect: { x: 700, y: 100, width: 250, height: 350 },
        locationText: "Minum Kelapa",
        actions: [
            { 
                text: 'Minum Kelapa (Rp 30)', 
                cost: 30, 
                effects: [
                    { stat: 'hunger', delta: 5 },
                    { stat: 'happiness', delta: 2 }
                ] 
            }
        ]
    },
    {
        id: 'volleyball',
        name: 'Lapangan Voli',
        rect: { x: 180, y: 500, width: 345, height: 150 },
        locationText: "Bermain Voli",
        actions: [
            { 
                text: 'Main Voli', 
                cost: 0, 
                effects: [
                    { stat: 'happiness', delta: 8 },
                    { stat: 'energy', delta: -5 }
                ] 
            }
        ]
    }
];

const PantaiScreen = () => {
    const { gameState, dispatch } = useContext(GameContext);
    const [playerPosition, setPlayerPosition] = useState(null);
    const [currentInteractableArea, setCurrentInteractableArea] = useState(null);
    const transitionGelapRef = useRef(null);

    useEffect(() => {
        dispatch({ type: 'SET_LOCATION', payload: 'Pantai' });
    }, [dispatch]);

    const handlePlayerPositionChange = useCallback((newPosition) => {
        setPlayerPosition(newPosition);
        
        // Check for intersection with interaction areas
        const intersectedArea = INTERACTION_AREAS_PANTAI.find(area => {
            return (
                newPosition.x + newPosition.width > area.rect.x &&
                newPosition.x < area.rect.x + area.rect.width &&
                newPosition.y + newPosition.height > area.rect.y &&
                newPosition.y < area.rect.y + area.rect.height
            );
        });
        
        setCurrentInteractableArea(intersectedArea || null);
    }, []);

    const handleInteraction = (action) => {
        if (!action) return;
        
        const { cost, effects } = action;

        // Check if player can afford
        if (gameState.money < cost) {
            alert(`Uang tidak cukup! Dibutuhkan Rp ${cost}, kamu memiliki Rp ${gameState.money}`);
            return;
        }

        // Deduct money if there's a cost
        if (cost > 0) {
            dispatch({ type: 'UPDATE_MONEY', amount: -cost });
        }

        // Apply all effects
        effects.forEach(effect => {
            if (effect.delta !== undefined) {
                dispatch({
                    type: 'UPDATE_STATUS_DELTA',
                    stat: effect.stat,
                    delta: effect.delta
                });
            }
        });

        // Update location text
        dispatch({
            type: 'UPDATE_INFO_BAR_LOCATION',
            payload: `Lokasi: ${currentInteractableArea?.locationText || 'Pantai'}`
        });

        // Hide the interaction buttons
        setCurrentInteractableArea(null);
    };

    const pantaiBounds = { 
        minX: 0, 
        maxX: window.innerWidth, 
        minY: 80, 
        maxY: window.innerHeight - 20 
    };

    const showTransitionGelap = () => {
        if (transitionGelapRef.current) {
            transitionGelapRef.current.classList.add('opacity-100', 'pointer-events-auto');
            transitionGelapRef.current.classList.remove('opacity-0', 'pointer-events-none');
        }
    };

    return (
        <ScreenTransition>
            <div className="relative w-screen h-screen overflow-hidden bg-[url('/images/gambar/pantai2.png')] bg-cover bg-center font-utama">
                <div
                    ref={transitionGelapRef}
                    className="fixed top-0 left-0 w-full h-full bg-black opacity-0 pointer-events-none transition-opacity duration-500 ease-in-out z-[1003]"
                ></div>

                <div id="arena-top" className="fixed top-0 left-0 w-full z-[100]">
                    <StatusBar />
                    <InfoBar />
                </div>

                <Player
                    initialX={100}
                    initialY={200}
                    bounds={pantaiBounds}
                    onPositionChange={handlePlayerPositionChange}
                    spriteWidth={100}
                    spriteHeight={150}
                />

                {currentInteractableArea && currentInteractableArea.actions && playerPosition && (
                    <div 
                        className="absolute z-[1000] pointer-events-auto"
                        style={{
                            left: `${playerPosition.x + playerPosition.width / 2}px`,
                            top: `${playerPosition.y - 90}px`,
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            alignItems: 'center',
                        }}
                    >
                        {currentInteractableArea.actions.map((action, index) => (
                            <ActionButton
                                key={index}
                                text={action.text}
                                onClick={() => handleInteraction(action)}
                                className="w-max"
                            />
                        ))}
                    </div>
                )}

                {/* Debugging - show interaction areas */}
                {/* {INTERACTION_AREAS_PANTAI.map(area => (
                    <div
                        key={area.id}
                        className={`absolute border-2 ${currentInteractableArea?.id === area.id ? 'border-yellow-400' : 'border-red-400'}`}
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