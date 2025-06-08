import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { GameContext } from '../contexts/GameContext.jsx';
import StatusBar from '../components/StatusBar.jsx';
import InfoBar from '../components/InfoBar.jsx';
import Player from '../components/Player.jsx';
import Map from '../components/Map.jsx';
import ArrowControls from '../components/ArrowControls.jsx';
import ScreenTransition from '../components/ScreenTransition.jsx';

// Define interaction areas for Billiard
// These are CSS percentages from style.css, converted for conceptual use.
// You'll need to define these as pixel rects (x, y, width, height) based on your background and player.
// The original CSS uses transform: translate for positioning, so the x,y below are illustrative.
const INTERACTION_AREAS_BILLIARD = [
    // For simplicity, providing conceptual pixel rects. Adjust these precisely.
    // Original CSS: #bar width: 30%; height: 10%; left: 90%; top: 33%; transform: translate(-250%, -180%);
    { id: 'bar', name: 'Bar', rect: { x: 300, y: 150, width: 200, height: 80 }, text: 'Beli Minuman di Bar', effects: [{ stat: 'hunger', delta: 1, interval: true }, {stat: 'happiness', delta: 1, interval: true}] }, //
    // Original CSS: #bltable width: 40%; height: 40%; left: 90%; top: 33%; transform: translate(-150%, 50%);
    { id: 'bltable', name: 'Billiard Table', rect: { x: 500, y: 400, width: 300, height: 250 }, text: 'Main Billiard', effects: [{ stat: 'happiness', delta: 2, interval: true }, { stat: 'energy', delta: -1, interval: true }] }, //
    // Original CSS: #bltoilet width: 15%; height: 30%; left: 90%; top: 33%; transform: translate(-155%, -90%);
    { id: 'bltoilet', name: 'Toilet', rect: { x: 700, y: 100, width: 100, height: 150 }, text: 'Gunakan Toilet', effects: [{ stat: 'hygiene', delta: 2, interval: true }] }, //
];

const BilliardScreen = () => {
    const { gameState, dispatch } = useContext(GameContext);
    const [playerPosition, setPlayerPosition] = useState(null);
    const [collidingWith, setCollidingWith] = useState(null);
    const interactionIntervalRef = useRef(null);
    const transitionGelapRef = useRef(null);

    useEffect(() => {
        dispatch({ type: 'SET_LOCATION', payload: 'Billiard' });
    }, [dispatch]);

    const clearInteractionInterval = useCallback(() => {
        if (interactionIntervalRef.current) {
            clearInterval(interactionIntervalRef.current);
            interactionIntervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (!playerPosition) return;

        let currentCollision = null;
        for (const area of INTERACTION_AREAS_BILLIARD) {
            const playerRect = {
                left: playerPosition.x,
                top: playerPosition.y,
                right: playerPosition.x + playerPosition.width,
                bottom: playerPosition.y + playerPosition.height,
            };
            // Area rects are already in pixels
            if (
                playerRect.left < area.rect.right &&
                playerRect.right > area.rect.left &&
                playerRect.top < area.rect.bottom &&
                playerRect.bottom > area.rect.top
            ) {
                currentCollision = area;
                break;
            }
        }

        if (currentCollision) {
            if (collidingWith?.id !== currentCollision.id) {
                setCollidingWith(currentCollision);
                dispatch({ type: 'UPDATE_INFO_BAR_LOCATION', payload: `Lokasi: ${currentCollision.name}` });
                clearInteractionInterval();

                const intervalEffects = currentCollision.effects?.filter(e => e.interval);
                if (intervalEffects && intervalEffects.length > 0) {
                    interactionIntervalRef.current = setInterval(() => {
                        intervalEffects.forEach(effect => {
                            dispatch({ type: 'UPDATE_STATUS_DELTA', stat: effect.stat, delta: effect.delta });
                        });
                    }, 1000); //
                }
            }
        } else {
            if (collidingWith) {
                setCollidingWith(null);
                dispatch({ type: 'UPDATE_INFO_BAR_LOCATION', payload: `Lokasi: Billiard` });
                clearInteractionInterval();
            }
        }
        return () => clearInteractionInterval();
    }, [playerPosition, collidingWith, dispatch, clearInteractionInterval]);

    const handlePlayerPositionChange = useCallback((newPosition) => {
        setPlayerPosition(newPosition);
    }, []);

    const billiardBounds = { minX: 50, maxX: window.innerWidth - 50, minY: 100, maxY: window.innerHeight - 50 };

    const showTransitionGelap = () => {
        if (transitionGelapRef.current) {
            transitionGelapRef.current.classList.add('opacity-100', 'pointer-events-auto');
            transitionGelapRef.current.classList.remove('opacity-0', 'pointer-events-none');
        }
    };

    return (
        <ScreenTransition>
            <div className="relative w-screen h-screen overflow-hidden bg-[url('/images/gambar/inside-billiard.png')] bg-cover bg-center font-utama"> {/* */}
                <div ref={transitionGelapRef} className="fixed top-0 left-0 w-full h-full bg-black opacity-0 pointer-events-none transition-opacity duration-500 ease-in-out z-[1003]"></div>
                <div id="arena-top" className="fixed top-0 left-0 w-full z-[100]">
                    <StatusBar />
                    <InfoBar />
                </div>
                <Player
                    initialX={200} initialY={300} // Adjust spawn point
                    bounds={billiardBounds}
                    onPositionChange={handlePlayerPositionChange}
                    spriteWidth={100} spriteHeight={150}
                />
                {/* Debugging visuals for collision areas */}
                {/* {INTERACTION_AREAS_BILLIARD.map(area => (
                    <div key={area.id} className={`absolute border-2 ${collidingWith?.id === area.id ? 'border-yellow-400 bg-yellow-400 bg-opacity-30' : 'border-red-500'}`}
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

export default BilliardScreen;