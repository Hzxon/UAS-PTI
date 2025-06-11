import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { GameContext } from '../contexts/GameContext.jsx';
import StatusBar from '../components/StatusBar.jsx';
import InfoBar from '../components/InfoBar.jsx';
import Player from '../components/Player.jsx';
import Map from '../components/Map.jsx';
import ArrowControls from '../components/ArrowControls.jsx';
import ScreenTransition from '../components/ScreenTransition.jsx';
import ActionButton from '../components/ActionButton.jsx';

const INTERACTION_AREAS_GUNUNG = [
    {
        id: 'nginep', name: 'Penginapan',
        rect: { x: 344, y: 381, width: 60, height: 20 },
        locationText: "di Penginapan",
        actions: [
            { text: 'Menginap (Rp 200)', cost: 200, effects: [{ stat: 'energy', valueSet: 70 }, { stat: 'hygiene', delta: -10 }], timeAdvanceHours: 8, type: 'sleep' },
            { text: 'Nginep + Mandi (Rp 200)', cost: 200, effects: [{ stat: 'energy', valueSet: 100 }, { stat: 'hygiene', valueSet: 40 }], timeAdvanceHours: 9, type: 'sleep_bath' },
        ]
    },
    {
        id: 'cafe', name: 'Kafe',
        rect: { x: 670, y: 427, width: 60, height: 20 },
        locationText: "di Kafe Gunung",
        availableDaytimeOnly: true,
        actions: [
            { text: 'Beli Makan (Rp 40)', cost: 40, effects: [{ stat: 'hunger', delta: 20 }, { stat: 'happiness', delta: 20 }, { stat: 'energy', delta: 5 }, { stat: 'hygiene', delta: -10 }], timeAdvanceHours: 1 },
            { text: 'Beli Minum (Rp 10)', cost: 10, effects: [{ stat: 'hunger', delta: 5 }, { stat: 'happiness', delta: 10 }, { stat: 'energy', delta: 3 }, { stat: 'hygiene', delta: -10 }] },
        ]
    },
    {
        id: 'sovenir', name: 'Toko Sovenir',
        rect: { x: window.innerWidth - 530, y: window.innerHeight - 140, width: 100, height: 200 },
        locationText: "di Toko Sovenir",
        availableDaytimeOnly: true,
        actions: [
            { text: 'Beli Sovenir (Rp 50)', cost: 50, effects: [{ stat: 'happiness', special: 'sovenirHappiness' }], type: 'buy_sovenir' },
        ]
    },
    {
        id: 'foto', name: 'Spot Foto',
        rect: { x: 555, y: window.innerHeight - 95, width: 70, height: 20 },
        locationText: "di Spot Foto",
        availableDaytimeOnly: true,
        actions: [
            { text: 'Lihat Spot Foto (Rp 100)', cost: 100, effects: [{ stat: 'happiness', special: 'fotoHappiness' }], timeAdvanceHours: 1, type: 'view_photo' },
        ]
    },
];

const GunungScreen = () => {
    const { gameState, dispatch } = useContext(GameContext);
    const [playerPosition, setPlayerPosition] = useState(null);
    const [currentInteractableArea, setCurrentInteractableArea] = useState(null);
    const [showPhotoModal, setShowPhotoModal] = useState(false);
    const [sovenirPurchaseCount, setSovenirPurchaseCount] = useState(0);
    const [photoViewCount, setPhotoViewCount] = useState(0);

    const transitionGelapRef = useRef(null);
    const isMalam = gameState.gameHour >= 18 || gameState.gameHour < 6;

    const gunungBounds = { minX: 100, maxX: 810, minY: 400, maxY: 560 };

    const showPageTransition = () => {
        if (transitionGelapRef.current) {
            transitionGelapRef.current.classList.add('opacity-100', 'pointer-events-auto');
            transitionGelapRef.current.classList.remove('opacity-0', 'pointer-events-none');
        }
    };

    useEffect(() => {
        dispatch({ type: 'SET_LOCATION', payload: 'Gunung' });
        const savedSovenirCount = parseInt(localStorage.getItem('gunungSovenirCount') || '0');
        const savedPhotoCount = parseInt(localStorage.getItem('gunungPhotoCount') || '0');
        setSovenirPurchaseCount(savedSovenirCount);
        setPhotoViewCount(savedPhotoCount);
    }, [dispatch]);

    useEffect(() => {
        localStorage.setItem('gunungSovenirCount', sovenirPurchaseCount.toString());
        localStorage.setItem('gunungPhotoCount', photoViewCount.toString());
    }, [sovenirPurchaseCount, photoViewCount]);

    const handlePlayerPositionChange = useCallback((newPosition) => {
        setPlayerPosition(newPosition);
        const intersectedArea = INTERACTION_AREAS_GUNUNG.find(area => {
            if (area.availableDaytimeOnly && isMalam) return false;
            return (
                newPosition.x + newPosition.width > area.rect.x &&
                newPosition.x < area.rect.x + area.rect.width &&
                newPosition.y + newPosition.height > area.rect.y &&
                newPosition.y < area.rect.y + area.rect.height
            );
        });
        setCurrentInteractableArea(intersectedArea || null);
    }, [isMalam]);

    const handleGenericInteraction = (action) => {
        if (!action) return;
        const { cost, effects, timeAdvanceHours, type } = action;
        if (gameState.money < cost) {
            alert("Uang tidak cukup!");
            return;
        }

        const needsGelapTransition = type === 'sleep' || type === 'sleep_bath' || type === 'view_photo';
        if (needsGelapTransition && transitionGelapRef.current) {
            transitionGelapRef.current.classList.add('opacity-100', 'pointer-events-auto');
            transitionGelapRef.current.classList.remove('opacity-0', 'pointer-events-none');
        }

        setTimeout(() => {
            dispatch({ type: 'UPDATE_MONEY', amount: -cost });
            if (timeAdvanceHours) {
                dispatch({ type: 'ADVANCE_TIME', hours: timeAdvanceHours });
            }
            if (effects) {
                effects.forEach(effect => {
                    if (effect.valueSet !== undefined) {
                        dispatch({ type: 'UPDATE_STAT', stat: effect.stat, value: effect.valueSet });
                    } else if (effect.delta !== undefined) {
                        dispatch({ type: 'UPDATE_STATUS_DELTA', stat: effect.stat, delta: effect.delta });
                    } else if (effect.special === 'sovenirHappiness') {
                        let hapDelta = 30;
                        if (sovenirPurchaseCount === 1) hapDelta = 10;
                        else if (sovenirPurchaseCount >= 2) hapDelta = -10;
                        dispatch({ type: 'UPDATE_STATUS_DELTA', stat: 'happiness', delta: hapDelta });
                        setSovenirPurchaseCount(prev => prev + 1);
                    } else if (effect.special === 'fotoHappiness') {
                        let hapDelta = 50;
                        if (photoViewCount === 1) hapDelta = 0;
                        else if (photoViewCount >= 2) hapDelta = -50;
                        dispatch({ type: 'UPDATE_STATUS_DELTA', stat: 'happiness', delta: hapDelta });
                        setPhotoViewCount(prev => prev + 1);
                    }
                });
            }

            dispatch({ type: 'UPDATE_INFO_BAR_LOCATION', payload: `Lokasi: ${currentInteractableArea?.locationText || 'Gunung'}` });
            if (type === 'view_photo') {
                setShowPhotoModal(true);
            }

            if (needsGelapTransition && transitionGelapRef.current) {
                setTimeout(() => {
                    transitionGelapRef.current.classList.add('opacity-0', 'pointer-events-none');
                    transitionGelapRef.current.classList.remove('opacity-100', 'pointer-events-auto');
                }, 500);
            }
        }, needsGelapTransition ? 500 : 0);

        setCurrentInteractableArea(null);
    };

    return (
        <ScreenTransition>
            <div className={`relative w-screen h-screen overflow-hidden bg-cover bg-bottom bg-fixed font-utama ${isMalam ? "bg-[url('/images/gambar/tampilan-gunung-malam.png')]" : "bg-[url('/images/gambar/tampilan-gunung.png')]"}`}>
                <div ref={transitionGelapRef} className="fixed top-0 left-0 w-full h-full bg-black opacity-0 pointer-events-none transition-opacity duration-500 ease-in-out z-[900]" />

                <div id="arena-top" className="fixed top-0 left-0 w-full z-[100]">
                    <StatusBar />
                    <InfoBar />
                </div>

                <Player
                    initialX={180}
                    initialY={450}
                    bounds={gunungBounds}
                    onPositionChange={handlePlayerPositionChange}
                    spriteWidth={100}
                    spriteHeight={100}
                />

                {currentInteractableArea && currentInteractableArea.actions && playerPosition && (
                    <div className="absolute z-[1000] pointer-events-auto" 
                    style={{
                        left: `${playerPosition.x + playerPosition.width / 2}px`,
                        top: `${playerPosition.y - 90}px`,
                        transform: 'translateX(-50%)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                        alignItems: 'center',
                    }}>
                        {currentInteractableArea.actions.map((action, index) => (
                            <ActionButton
                                key={index}
                                text={action.text}
                                onClick={() => handleGenericInteraction(action)}
                                className="w-max"
                            />
                        ))}
                    </div>
                )}

                {showPhotoModal && (
                    <div id="lihat-foto" className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[998] bg-black bg-opacity-70">
                        <div id="isi-foto" className="relative w-full max-w-3xl bg-center bg-no-repeat bg-cover">
                            <img id="pemandangan" src="/gambar/foto-gunung.png" alt="Pemandangan Gunung" className="w-full" />
                            <button
                                className="tutup-foto fixed bottom-5 right-5 w-[100px] py-2 px-3 bg-[#ffcf40] border-none rounded-md shadow-md cursor-pointer font-utama text-white font-bold text-4xl transition-all duration-1000 hover:w-[120px] hover:bg-[#d29e00] hover:border-2 hover:border-black"
                                onClick={() => {
                                    setShowPhotoModal(false);
                                    if (transitionGelapRef.current) {
                                        transitionGelapRef.current.classList.add('opacity-0', 'pointer-events-none');
                                        transitionGelapRef.current.classList.remove('opacity-100', 'pointer-events-auto');
                                    }
                                }}
                            >
                                &gt;
                            </button>
                        </div>
                    </div>
                )}

                <Map onNavigateStart={showPageTransition} />
                <ArrowControls />
            </div>
        </ScreenTransition>
    );
};

// Define interaction areas for Gunung
// The original CSS uses fixed positioning and transform for these.
// Convert these to rects {x, y, width, height} in pixels relative to your game area.
// Values below are highly illustrative and need precise adjustment.

// const INTERACTION_AREAS_GUNUNG = [
//     {
//         id: 'nginep', name: 'Penginapan',
//         rect: { x: 374 - 30, y: 391 - 10, width: 60, height: 20 }, // Original #nginep size
//         locationText: "di Penginapan",
//         actions: [ // Multiple actions for one area
//             { text: 'Menginap (Rp 200)', cost: 200, effects: [{ stat: 'energy', valueSet: 70 }, { stat: 'hygiene', delta: -10 }], timeAdvanceHours: 8, type: 'sleep' }, //
//             { text: 'Nginep + Mandi (Rp 200)', cost: 200, effects: [{ stat: 'energy', valueSet: 100 }, { stat: 'hygiene', valueSet: 40 }], timeAdvanceHours: 9, type: 'sleep_bath' }, //
//         ]
//     },
//     {
//         id: 'cafe', name: 'Kafe',
//         rect: { x: 700 - 30, y: 437 - 10, width: 60, height: 20 }, // Original #cafe size
//         locationText: "di Kafe Gunung",
//         availableDaytimeOnly: true, //
//         actions: [
//             { text: 'Beli Makan (Rp 40)', cost: 40, effects: [{ stat: 'hunger', delta: 20 }, { stat: 'happiness', delta: 20 }, {stat: 'energy', delta: 5}, {stat: 'hygiene', delta: -10}], timeAdvanceHours: 1 }, //
//             { text: 'Beli Minum (Rp 10)', cost: 10, effects: [{ stat: 'hunger', delta: 5 }, {stat: 'happiness', delta: 10}, {stat: 'energy', delta: 3}, {stat: 'hygiene', delta: -10}] }, //
//         ]
//     },
//     {
//         id: 'sovenir', name: 'Toko Sovenir',
//         rect: { x: window.innerWidth - 480 - 50 , y: window.innerHeight - 40 - 100, width: 100, height: 200 }, // Original #sovenir size (right: 480px, bottom: 40px)
//         locationText: "di Toko Sovenir",
//         availableDaytimeOnly: true, //
//         actions: [
//             { text: 'Beli Sovenir (Rp 50)', cost: 50, effects: [{ stat: 'happiness', special: 'sovenirHappiness' }], type: 'buy_sovenir' }, //
//         ]
//     },
//     {
//         id: 'foto', name: 'Spot Foto',
//         rect: { x: 590 - 35, y: window.innerHeight - 85 - 10, width: 70, height: 20 }, // Original #foto size
//         locationText: "di Spot Foto",
//         availableDaytimeOnly: true, //
//         actions: [
//             { text: 'Lihat Spot Foto (Rp 100)', cost: 100, effects: [{ stat: 'happiness', special: 'fotoHappiness' }], timeAdvanceHours: 1, type: 'view_photo' }, //
//         ]
//     },
// ];


// const GunungScreen = () => {
//     const { gameState, dispatch } = useContext(GameContext);
//     const [playerPosition, setPlayerPosition] = useState(null);
//     const [currentInteractableArea, setCurrentInteractableArea] = useState(null); // The whole area object
//     const [showPhotoModal, setShowPhotoModal] = useState(false);
//     const [sovenirPurchaseCount, setSovenirPurchaseCount] = useState(0); // Local state for sovenir logic
//     const [photoViewCount, setPhotoViewCount] = useState(0); // Local state for photo logic

//     const transitionGelapRef = useRef(null); // For sleep and photo transitions

//     const isMalam = gameState.gameHour >= 18 || gameState.gameHour < 6; //

//     useEffect(() => {
//         dispatch({ type: 'SET_LOCATION', payload: 'Gunung' });
//         // Load purchase counts from localStorage if you want them to persist across sessions/reloads
//         const savedSovenirCount = parseInt(localStorage.getItem('gunungSovenirCount') || '0');
//         const savedPhotoCount = parseInt(localStorage.getItem('gunungPhotoCount') || '0');
//         setSovenirPurchaseCount(savedSovenirCount);
//         setPhotoViewCount(savedPhotoCount);
//     }, [dispatch]);

//     useEffect(() => {
//         localStorage.setItem('gunungSovenirCount', sovenirPurchaseCount.toString());
//         localStorage.setItem('gunungPhotoCount', photoViewCount.toString());
//     }, [sovenirPurchaseCount, photoViewCount]);


//     const handlePlayerPositionChange = useCallback((newPosition) => {
//         setPlayerPosition(newPosition);
//     }, []);

//     useEffect(() => {
//         if (!playerPosition) return;
//         let foundInteractable = null;
//         for (const area of INTERACTION_AREAS_GUNUNG) {
//             // Skip daytime-only interactions if it's night
//             if (area.availableDaytimeOnly && isMalam) continue;

//             const playerRect = { /* ... player position ... */
//                 left: playerPosition.x,
//                 top: playerPosition.y,
//                 right: playerPosition.x + playerPosition.width,
//                 bottom: playerPosition.y + playerPosition.height,
//             };
//             if (
//                 playerRect.left < area.rect.right &&
//                 playerRect.right > area.rect.left &&
//                 playerRect.top < area.rect.bottom &&
//                 playerRect.bottom > area.rect.top
//             ) {
//                 foundInteractable = area;
//                 break;
//             }
//         }
//         setCurrentInteractableArea(foundInteractable);
//     }, [playerPosition, isMalam]);

//     const handleGenericInteraction = (action) => {
//         if (!action) return;
//         const { cost, effects, timeAdvanceHours, type } = action;

//         if (gameState.money < cost) {
//             alert("Uang tidak cukup!");
//             return;
//         }

//         // Show gelap transition for certain actions
//         const needsGelapTransition = type === 'sleep' || type === 'sleep_bath' || type === 'view_photo';
//         if (needsGelapTransition && transitionGelapRef.current) {
//             transitionGelapRef.current.classList.add('opacity-100', 'pointer-events-auto');
//             transitionGelapRef.current.classList.remove('opacity-0', 'pointer-events-none');
//         }

//         setTimeout(() => {
//             dispatch({ type: 'UPDATE_MONEY', amount: -cost });
//             if (timeAdvanceHours) {
//                 dispatch({ type: 'ADVANCE_TIME', hours: timeAdvanceHours }); // Assuming ADVANCE_TIME can take hours
//             }

//             if (effects) {
//                 effects.forEach(effect => {
//                     if (effect.valueSet !== undefined) {
//                         dispatch({ type: 'UPDATE_STAT', stat: effect.stat, value: effect.valueSet });
//                     } else if (effect.delta !== undefined) {
//                         dispatch({ type: 'UPDATE_STATUS_DELTA', stat: effect.stat, delta: effect.delta });
//                     } else if (effect.special === 'sovenirHappiness') { //
//                         let hapDelta = 30;
//                         if (sovenirPurchaseCount === 1) hapDelta = 10;
//                         else if (sovenirPurchaseCount >= 2) hapDelta = -10;
//                         dispatch({ type: 'UPDATE_STATUS_DELTA', stat: 'happiness', delta: hapDelta });
//                         setSovenirPurchaseCount(prev => prev + 1);
//                     } else if (effect.special === 'fotoHappiness') { //
//                         let hapDelta = 50;
//                         if (photoViewCount === 1) hapDelta = 0;
//                         else if (photoViewCount >= 2) hapDelta = -50;
//                         dispatch({ type: 'UPDATE_STATUS_DELTA', stat: 'happiness', delta: hapDelta });
//                         setPhotoViewCount(prev => prev + 1);
//                     }
//                 });
//             }
            
//             dispatch({ type: 'UPDATE_INFO_BAR_LOCATION', payload: `Lokasi: ${currentInteractableArea?.locationText || 'Gunung'}` });

//             if (type === 'view_photo') {
//                 setShowPhotoModal(true);
//             }

//             // Hide gelap transition
//             if (needsGelapTransition && transitionGelapRef.current) {
//                  setTimeout(() => { // Ensure state updates apply before removing overlay
//                     transitionGelapRef.current.classList.add('opacity-0', 'pointer-events-none');
//                     transitionGelapRef.current.classList.remove('opacity-100', 'pointer-events-auto');
//                 }, 500); // Duration of effect + small buffer
//             }
//         }, needsGelapTransition ? 500 : 0); // Delay for transition
//          setCurrentInteractableArea(null); // Hide buttons after action
//     };

//     const gunungBounds = { minX: 100, maxX: 810, minY: 400, maxY: 460 + 100 /* player height */ }; // (original JS bounds)

//     const showPageTransition = () => { /* ... same as other screens ... */
//         if (transitionGelapRef.current) { // Re-use gelap for page transitions too
//             transitionGelapRef.current.classList.add('opacity-100', 'pointer-events-auto');
//             transitionGelapRef.current.classList.remove('opacity-0', 'pointer-events-none');
//         }
//     };

//     return (
//         <ScreenTransition>
//             <div className={`relative w-screen h-screen overflow-hidden bg-cover bg-bottom bg-fixed font-utama 
//                 ${isMalam ? "bg-[url('/gambar/tampilan-gunung-malam.png')]" : "bg-[url('/images/gambar/tampilan-gunung.png')]"}`}> {/* */}
                
//                 <div ref={transitionGelapRef} className="fixed top-0 left-0 w-full h-full bg-black opacity-0 pointer-events-none transition-opacity duration-500 ease-in-out z-[1003]"></div> {/* */}

//                 <div id="arena-top" className="fixed top-0 left-0 w-full z-[100]">
//                     <StatusBar />
//                     <InfoBar />
//                 </div>
//                 <Player
//                     initialX={180} initialY={450} //
//                     bounds={gunungBounds}
//                     onPositionChange={handlePlayerPositionChange}
//                     spriteWidth={100} spriteHeight={100} // Original uses 100px width
//                 />

//                 {/* Action Buttons for Gunung */}
//                 {currentInteractableArea && currentInteractableArea.actions && playerPosition && (
//                     <div className="absolute z-[60]" style={{
//                         left: `${playerPosition.x + playerPosition.width / 2 - 100}px`, // Position near player
//                         top: `${playerPosition.y - (currentInteractableArea.actions.length * 45)}px`, // Stack buttons upwards
//                         display: 'flex',
//                         flexDirection: 'column',
//                         gap: '5px'
//                     }}>
//                         {currentInteractableArea.actions.map((action, index) => (
//                             <ActionButton
//                                 key={index}
//                                 text={action.text}
//                                 onClick={() => handleGenericInteraction(action)}
//                                 className="w-max" // Allow button to size to content
//                                 // style prop for ActionButton doesn't need to be set here if parent div handles positioning
//                             />
//                         ))}
//                     </div>
//                 )}

//                 {/* Photo Modal */}
//                 {showPhotoModal && (
//                     <div id="lihat-foto" className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[998] bg-black bg-opacity-70"> {/* */}
//                         <div id="isi-foto" className="relative w-full max-w-3xl bg-center bg-no-repeat bg-cover"> {/* */}
//                             <img id="pemandangan" src="/gambar/foto-gunung.png" alt="Pemandangan Gunung" className="w-full" /> {/* */}
//                             <button
//                                 className="tutup-foto fixed bottom-5 right-5 w-[100px] py-2 px-3 bg-[#ffcf40] border-none rounded-md shadow-md cursor-pointer font-utama text-white font-bold text-4xl transition-all duration-1000 hover:w-[120px] hover:bg-[#d29e00] hover:border-2 hover:border-black" //
//                                 onClick={() => {
//                                     setShowPhotoModal(false);
//                                     // Ensure gelap transition is also hidden if it was shown for this
//                                     if (transitionGelapRef.current) {
//                                         transitionGelapRef.current.classList.add('opacity-0', 'pointer-events-none');
//                                         transitionGelapRef.current.classList.remove('opacity-100', 'pointer-events-auto');
//                                     }
//                                 }}
//                             >
//                                 &gt; {/* Original was '>', style.css has font-size 50px which is large */}
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {/* Debugging visuals */}
//                  {/* {INTERACTION_AREAS_GUNUNG.map(area => {
//                     if (area.availableDaytimeOnly && isMalam) return null;
//                     return (
//                     <div key={area.id} className={`absolute border-2 ${currentInteractableArea?.id === area.id ? 'border-yellow-400 bg-yellow-400 bg-opacity-30' : 'border-green-500'}`}
//                         style={{ left: `${area.rect.x}px`, top: `${area.rect.y}px`, width: `${area.rect.width}px`, height: `${area.rect.height}px` }}>
//                         <span className="text-white bg-black p-1 text-xs">{area.name} {area.availableDaytimeOnly && "(Siang)"}</span>
//                     </div>
//                  )})} */}

//                 <Map onNavigateStart={showPageTransition} />
//                 <ArrowControls />
//             </div>
//         </ScreenTransition>
//     );
// };

export default GunungScreen;