import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { GameContext } from '../contexts/GameContext.jsx';
import StatusBar from '../components/StatusBar.jsx';
import InfoBar from '../components/InfoBar.jsx';
import Player from '../components/Player.jsx';
import Map from '../components/Map.jsx';
import ArrowControls from '../components/ArrowControls.jsx'; // Assuming ArrowControls calls a movePlayer function passed via props or context
import ScreenTransition from '../components/ScreenTransition.jsx';

// Define interaction areas for Rumah
// Dimensions are percentages of viewport width/height, adjust if your Player component uses fixed pixel sizes for areas.
// For simplicity, these are approximate. You'll need to fine-tune these based on your actual background image and desired interaction zones.
const INTERACTION_AREAS_RUMAH = [
    { id: 'bed', name: 'Bed', x: 13, y: 35, width: 12, height: 30, text: 'Tidur di Kasur', cost: 0, effects: [{ stat: 'energy', delta: 2, interval: true }, {stat: 'happiness', delta: 1, interval: true}] }, //
    { id: 'table', name: 'Table', x: 71, y: 70, width: 14, height: 20, text: 'Makan di Meja', cost: 0, effects: [{ stat: 'hunger', delta: 1, interval: true }] }, //
    { id: 'toilet', name: 'Toilet', x: 45, y: 20, width: 5, height: 10, text: 'Gunakan Toilet', cost: 0, effects: [{ stat: 'hygiene', delta: 2, interval: true }] }, //
    { id: 'bathroom', name: 'Bathroom', x: 90, y: 33, width: 10, height: 15, text: 'Mandi', cost: 0, effects: [{ stat: 'hygiene', delta: 3, interval: true }, {stat: 'happiness', delta:1, interval: true}] }, //
];


const RumahScreen = () => {
    const { gameState, dispatch } = useContext(GameContext);
    const [playerPosition, setPlayerPosition] = useState(null); // { x, y, width, height }
    const [collidingWith, setCollidingWith] = useState(null); // ID of the area
    const interactionIntervalRef = useRef(null);
    const transitionGelapRef = useRef(null);


    // Set current location when component mounts
    useEffect(() => {
        dispatch({ type: 'SET_LOCATION', payload: 'Rumah' });
        // Set default player position for Rumah if not already set by Player component's initial props
    }, [dispatch]);

    const clearInteractionInterval = useCallback(() => {
        if (interactionIntervalRef.current) {
            clearInterval(interactionIntervalRef.current);
            interactionIntervalRef.current = null;
        }
    },[]);

    

    // Collision detection and interaction logic
    useEffect(() => {
        if (!playerPosition) return;
        console.log('Player Position:', playerPosition); // Untuk melihat data posisi pemain

        let currentCollision = null;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        for (const area of INTERACTION_AREAS_RUMAH) {
            // Convert percentage-based area to pixels for collision
            const areaRect = {
                
                left: (area.x - area.width / 2) / 100 * viewportWidth,
                top: (area.y - area.height / 2) / 100 * viewportHeight,
                right: (area.x + area.width / 2) / 100 * viewportWidth,
                bottom: (area.y + area.height / 2) / 100 * viewportHeight,
            };
            console.log(`Checking area ${area.id}:`, areaRect); // Untuk melihat data area yang dihitung


            const playerRect = {
                left: playerPosition.x,
                top: playerPosition.y,
                right: playerPosition.x + playerPosition.width,
                bottom: playerPosition.y + playerPosition.height,
            };

            // Basic AABB collision detection
            if (
                playerRect.left < areaRect.right &&
                playerRect.right > areaRect.left &&
                playerRect.top < areaRect.bottom &&
                playerRect.bottom > areaRect.top
            ) {
                console.log(`Collision detected with: ${area.id}`);
                currentCollision = area;
                break;
            }
        }

        if (currentCollision) {
            if (collidingWith?.id !== currentCollision.id) {
                console.log(`New collision with ${currentCollision.id}, starting effects.`);
                setCollidingWith(currentCollision);
                dispatch({ type: 'UPDATE_INFO_BAR_LOCATION', payload: `Lokasi: ${currentCollision.name}` });

                clearInteractionInterval(); // Clear previous interval

                // Handle interval-based effects
                const intervalEffects = currentCollision.effects?.filter(e => e.interval);
                if (intervalEffects && intervalEffects.length > 0) {
                    interactionIntervalRef.current = setInterval(() => {
                        console.log(`Interval running for ${currentCollision.id}. Applying effects:`, intervalEffects); //jiro
                        intervalEffects.forEach(effect => {
                             dispatch({ type: 'UPDATE_STATUS_DELTA', stat: effect.stat, delta: effect.delta });
                        });
                        // Visual feedback for increasing stats
                        // This would be better handled by individual progress bars highlighting themselves
                    }, 1000); // Original game uses 1000ms for these increments
                }
            }
        } else {
            if (collidingWith) {
                console.log(`No longer colliding with ${collidingWith.id}, stopping effects.`);
                setCollidingWith(null);
                dispatch({ type: 'UPDATE_INFO_BAR_LOCATION', payload: `Lokasi: Rumah` }); // Reset to main location
                clearInteractionInterval();
            }
        }
         // Cleanup interval on component unmount or when dependencies change
        return () => clearInteractionInterval();

    }, [playerPosition, gameState.characterSprite, collidingWith, dispatch, clearInteractionInterval]);


    const handlePlayerPositionChange = useCallback((newPosition) => {
        setPlayerPosition(newPosition);
    }, []);

    // Define player movement boundaries for Rumah
    // These are example values, adjust based on your screen/game design
    const rumahBounds = {
        minX: 50,  // pixels from left
        maxX: window.innerWidth - 50, // pixels from left (screen width - offset)
        minY: 100, // pixels from top (below infobar)
        maxY: window.innerHeight - 50, // pixels from top (screen height - offset)
    };

    // Placeholder for transition out effect on navigation
    // This would be triggered by the Map component before navigating
    const showTransitionGelap = () => {
        if (transitionGelapRef.current) {
            transitionGelapRef.current.classList.add('opacity-100', 'pointer-events-auto');
            transitionGelapRef.current.classList.remove('opacity-0', 'pointer-events-none');
        }
    };

    return (
        <ScreenTransition>
            <div className="relative w-screen h-screen overflow-hidden bg-[url('/images/gambar/inside-home.png')] bg-cover bg-center font-utama"> {/* Path relative to public folder */}
                {/* Transisi Gelap for specific actions like sleeping */}
                <div
                    ref={transitionGelapRef}
                    className="fixed top-0 left-0 w-full h-full bg-black opacity-0 pointer-events-none transition-opacity duration-500 ease-in-out z-[1003]" //
                ></div>

                <div id="arena-top" className="fixed top-0 left-0 w-full z-[100]">
                    <StatusBar />
                    <InfoBar />
                </div>

                <Player
                    initialX={500} // Starting X position in Rumah
                    initialY={200} // Starting Y position in Rumah
                    bounds={rumahBounds}
                    onPositionChange={handlePlayerPositionChange}
                    spriteWidth={100} // Match your player sprite's display width
                    spriteHeight={150} // Match your player sprite's display height
                />

                {/* For debugging collision areas */}
                {INTERACTION_AREAS_RUMAH.map(area => (
                    <div
                        key={area.id}
                        className={`absolute border-2 ${collidingWith?.id === area.id ? 'border-yellow-400 bg-yellow-400 bg-opacity-30' : 'border-red-500'} `}
                        style={{
                            left: `${area.x - area.width/2}%`,
                            top: `${area.y - area.height/2}%`,
                            width: `${area.width}%`,
                            height: `${area.height}%`,
                            transform: 'translate(-0%, -0%)' // Adjust if needed based on x,y definition
                        }}
                    >
                        <span className="text-white bg-black p-1 text-xs">{area.name}</span>
                    </div>
                ))}


                <Map
                    onNavigateStart={showTransitionGelap} // Callback to trigger transition before route change
                />
                {/* ArrowControls might need to interface with the Player component directly or via context/props drilling */}
                <ArrowControls
                // Pass functions to Player component if ArrowControls directly manipulates player
                // Or Player component listens to global key press state updated by ArrowControls
                />
            </div>
        </ScreenTransition>
    );
};

export default RumahScreen;