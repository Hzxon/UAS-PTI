import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { GameContext } from '../contexts/GameContext.jsx';
import StatusBar from '../components/StatusBar.jsx';
import InfoBar from '../components/InfoBar.jsx';
import Player from '../components/Player.jsx';
import Map from '../components/Map.jsx';
import ArrowControls from '../components/ArrowControls.jsx';
import ScreenTransition from '../components/ScreenTransition.jsx';
import ActionButton from '../components/ActionButton.jsx';
import InventoryBag from '../components/InventoryBag.jsx';
import ActivityLoadingScreen from '../components/ActivityLoadingScreen.jsx';


const INTERACTION_AREAS_BILLIARD = [
    {
        id: 'bar',
        name: 'Bar',
        rect: { x: 10, y: 105, width: 735, height: 75 },
        locationText: 'di Bar Billiard',
        actions: [
            {
                text: 'Amer (Rp 55)',
                cost: 15,
                effects:[{ special: 'amerBotol' }]
            },
            {
                text: 'Aqua (Rp 15)',
                cost: 15,
                effects:[{ special: 'aquaBotol' }]
            }
        ]
    },
    {
        id: 'bltable',
        name: 'Billiard Table',
        rect: { x: 470, y: 400, width: 600, height: 250 },
        locationText: 'Main Billiard',
        actions: [
            {
                text: 'Main Billiard',
                cost: 0,
                effects: [
                    { stat: 'happiness', delta: 2 },
                    { stat: 'energy', delta: -1 }
                ]
            }
        ]
    },
    {
        id: 'bltoilet',
        name: 'Toilet',
        rect: { x: 1040, y: 45, width: 205, height: 200 },
        locationText: 'Gunakan Toilet',
        actions: [
            {
                text: 'Toilet',
                cost: 0,
                effects: [
                    { stat: 'hygiene', delta: 2 }
                ]
            }
        ]
    }
];

const BilliardScreen = () => {
    const { gameState, dispatch } = useContext(GameContext);
    const [playerPosition, setPlayerPosition] = useState(null);
    const [currentInteractableArea, setCurrentInteractableArea] = useState(null);
    const transitionGelapRef = useRef(null);
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);


    useEffect(() => {
        dispatch({ type: 'SET_LOCATION', payload: 'Billiard' });
    }, [dispatch]);

    const handlePlayerPositionChange = useCallback((newPosition) => {
        setPlayerPosition(newPosition);

        const intersectedArea = INTERACTION_AREAS_BILLIARD.find(area => {
            return (
                newPosition.x + newPosition.width > area.rect.x &&
                newPosition.x < area.rect.x + area.rect.width &&
                newPosition.y + newPosition.height > area.rect.y &&
                newPosition.y < area.rect.y + area.rect.height
            );
        });

        setCurrentInteractableArea(intersectedArea || null);

        dispatch({
            type: 'UPDATE_INFO_BAR_LOCATION',
            payload: `Lokasi: ${intersectedArea?.locationText || 'Billiard'}`
        });
    }, [dispatch]);

        const handleInteraction = (action) => {
            if (!action) return;

            const { text, cost, effects } = action;

            if (cost > 0 && gameState.money < cost) {
                alert(`Uang tidak cukup! Dibutuhkan Rp ${cost}, kamu memiliki Rp ${gameState.money}`);
                return;
            }

            // Khusus untuk "Main Billiard", tampilkan loading dan jalankan efek setelahnya
            if (text === "Main Billiard") {
                setIsLoadingActivity(true);
                return; // jangan lanjut dulu
            }

            dispatch({ type: 'UPDATE_MONEY', amount: -cost });

            if (effects) {
                effects.forEach(effect => {
                    if (effect.valueSet !== undefined) {
                        dispatch({ type: 'UPDATE_STAT', stat: effect.stat, value: effect.valueSet });
                    } else if (effect.delta !== undefined) {
                        dispatch({ type: 'UPDATE_STATUS_DELTA', stat: effect.stat, delta: effect.delta });
                    } else if (effect.special === 'aquaBotol') {
                        dispatch({
                            type: 'ADD_ITEM',
                            payload: {
                                name: 'AQUA',
                                desc: 'Seger',
                                kelangkaan: 'Umum',
                                image: '/images/objek/aquaBotol.png',
                                usable: true,
                                useAction: {
                                    label: "Minum",
                                    effects: [{ stat: 'hunger', delta: 5 }, { stat: 'happiness', delta: 5 }, { stat: 'energy', delta: 3 }]
                                },
                            },
                        });
                    } else if (effect.special === 'amerBotol') {
                        dispatch({
                            type: 'ADD_ITEM',
                            payload: {
                                name: 'AMER',
                                desc: 'Hareudang Euyy',
                                kelangkaan: 'Biasa',
                                image: '/images/objek/amerBotol.png',
                                usable: true,
                                useAction: {
                                    label: "Minum",
                                    effects: [{ stat: 'hunger', delta: 5 }, { stat: 'happiness', delta: 5 }, { stat: 'energy', delta: 3 }]
                                },
                            },
                        });
                    }
                });
            }

            setCurrentInteractableArea(null);
        };

        useEffect(() => {
            const handleUnload = () => {
                localStorage.removeItem('inventoryItems');
            };
        
            window.addEventListener('beforeunload', handleUnload);
            return () => {
                window.removeEventListener('beforeunload', handleUnload);
            };
        }, []);



    const billiardBounds = {
        minX: 50,
        maxX: window.innerWidth - 50,
        minY: 100,
        maxY: window.innerHeight - 50
    };

    const showTransitionGelap = () => {
        if (transitionGelapRef.current) {
            transitionGelapRef.current.classList.add('opacity-100', 'pointer-events-auto');
            transitionGelapRef.current.classList.remove('opacity-0', 'pointer-events-none');
        }
    };

    return (
        <ScreenTransition>
            <div className="relative w-screen h-screen overflow-hidden bg-[url('/images/gambar/inside-billiard.png')] bg-cover bg-center font-utama">
                <div
                    ref={transitionGelapRef}
                    className="fixed top-0 left-0 w-full h-full bg-black opacity-0 pointer-events-none transition-opacity duration-500 ease-in-out z-[1003]"
                ></div>

                <div className="fixed top-0 left-0 w-full z-[100]">
                    <StatusBar />
                    <InfoBar />
                </div>

                <Player
                    initialX={200}
                    initialY={300}
                    bounds={billiardBounds}
                    onPositionChange={handlePlayerPositionChange}
                    spriteWidth={100}
                    spriteHeight={150}
                />

                {currentInteractableArea && currentInteractableArea.actions && playerPosition && (
                    <div
                        className="absolute z-[1000] pointer-events-auto"
                        style={{
                            left: `${currentInteractableArea.rect.x + currentInteractableArea.rect.width / 2}px`,
                            top: `${currentInteractableArea.rect.y - -200 - currentInteractableArea.actions.length * 40}px`,
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

                {INTERACTION_AREAS_BILLIARD.map(area => (
                    <div key={area.id}
                        className={`absolute border-[2px] border-dashed flex justify-center items-center ${currentInteractableArea?.id === area.id ? 'border-yellow-400 bg-yellow-400 bg-opacity-30' : 'border-green-500 bg-green-500 bg-opacity-20'}`}
                        style={{
                            left: `${area.rect.x}px`,
                            top: `${area.rect.y}px`,
                            width: `${area.rect.width}px`,
                            height: `${area.rect.height}px`
                        }}
                    >
                        <span className="text-white text-[30px]">!{/*{area.name}*/}</span>
                    </div>
                ))}

                {isLoadingActivity && (
                    <ActivityLoadingScreen
                        duration={3000} 
                        message="Sedang bermain Billiard..."
                        gifUrl="/public/images/gambar/animasiBiliard.gif"
                        onFinish={() => {
                            // Efek setelah loading selesai
                            dispatch({ type: 'UPDATE_STATUS_DELTA', stat: 'happiness', delta: 2 });
                            dispatch({ type: 'UPDATE_STATUS_DELTA', stat: 'energy', delta: -1 });

                            setIsLoadingActivity(false);
                            setCurrentInteractableArea(null);
                        }}
                    />
                )}


                

                <Map onNavigateStart={showTransitionGelap} />
                <ArrowControls />
                <InventoryBag />
            </div>
        </ScreenTransition>
    );
};

export default BilliardScreen;
