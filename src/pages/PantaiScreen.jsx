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

const ACTIVITY_CONFIG = {
    voli: {
        duration: 10000,
        message: 'Sedang bermain Voli...',
        gifUrl: '/images/gambar/animasiVoli.gif',
        effects: [
            { stat: 'happiness', delta: 2 },
            { stat: 'energy', delta: -1 },
        ],
    },
    berenang: {
        duration: 12000,
        message: 'Sedang berenang...',
        gifUrl: '/images/gambar/animasiBerenang.gif',
        effects: [
            { stat: 'hygiene', delta: -1 },
            { stat: 'happiness', delta: 2 },
        ],
    },
    mainPasir: {
        duration: 7000,
        message: 'Sedang main pasir...',
        gifUrl: '/images/gambar/animasiMainPasir.gif',
        effects: [
            { stat: 'hygiene', delta: -2 },
        ],
    },
};

const INTERACTION_AREAS_PANTAI = [
    {
        id: 'sea',
        name: 'Laut',
        rect: { x: 1100, y: 400, width: 410, height: 320 },
        locationText: "Berenang di Laut",
        actions: [
            {
                text: 'Berenang',
                cost: 0,
                activityKey: 'berenang'
            }
        ]
    },
    {
        id: 'bar',
        name: 'Bar Pantai',
        rect: { x: 130, y: 160, width: 285, height: 50 },
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
        rect: { x: 757, y: 240, width: 197, height: 90 },
        locationText: "Minum Kelapa",
        actions: [
            {
                text: 'Beli Kelapa (Rp 30)',
                cost: 30,
                effects: [{ special:'kelapa'}]
            }
        ]
    },
    {
        id: 'volleyball',
        name: 'Lapangan Voli',
        rect: { x: 164, y: 430, width: 377, height: 104 },
        locationText: "Bermain Voli",
        actions: [
            {
                text: 'Main Voli',
                cost: 0,
                activityKey: 'voli'
            }
        ]
    },
    {
        id: 'mainPasir',
        name: 'Main Pasir',
        rect: { x: 1220, y: 130, width: 200, height: 150 },
        locationText: "Main Pasir",
        actions: [
            {
                text: 'Main Pasir',
                cost: 0,
                activityKey: 'mainPasir'
            }
        ]
    }
];

const PantaiScreen = () => {
    const { gameState, dispatch } = useContext(GameContext);
    const [playerPosition, setPlayerPosition] = useState(null);
    const [currentInteractableArea, setCurrentInteractableArea] = useState(null);
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);
    const [currentActivity, setCurrentActivity] = useState(null);
    const transitionGelapRef = useRef(null);

    useEffect(() => {
        dispatch({ type: 'SET_LOCATION', payload: 'Pantai' });
    }, [dispatch]);

    const startActivity = (activityKey) => {
        setCurrentActivity(activityKey);
        setIsLoadingActivity(true);
    };

    const handlePlayerPositionChange = useCallback((newPosition) => {
        setPlayerPosition(newPosition);

        const intersectedArea = INTERACTION_AREAS_PANTAI.find(area => (
            newPosition.x + newPosition.width > area.rect.x &&
            newPosition.x < area.rect.x + area.rect.width &&
            newPosition.y + newPosition.height > area.rect.y &&
            newPosition.y < area.rect.y + area.rect.height
        ));

        setCurrentInteractableArea(intersectedArea || null);
    }, []);

    const handleInteraction = (action) => {
        if (action.activityKey) {
            startActivity(action.activityKey);
        } else {
            const { cost, effects } = action;
            if (cost > 0 && gameState.money < cost) {
                alert(`Uang tidak cukup! Dibutuhkan Rp ${cost}, kamu memiliki Rp ${gameState.money}`);
                return;
            }
            dispatch({ type: 'UPDATE_MONEY', amount: -cost });

            if (effects) {
                effects.forEach(effect => {
                    if (effect.valueSet !== undefined) {
                        dispatch({ type: 'UPDATE_STAT', stat: effect.stat, value: effect.valueSet });
                    } else if (effect.delta !== undefined) {
                        dispatch({ type: 'UPDATE_STATUS_DELTA', stat: effect.stat, delta: effect.delta });
                    } else if (effect.special === 'kelapa') {
                        dispatch({
                            type: 'ADD_ITEM',
                            payload: {
                                name: 'KELAPA',
                                desc: 'Kelapa segarr langsung dari pohonnya',
                                kelangkaan: 'Umum',
                                image: '/images/objek/kelapa.png',
                                usable: true,
                                useAction: {
                                    label: "Minum",
                                    effects: [
                                        { stat: 'hunger', delta: 5 },
                                        { stat: 'happiness', delta: 5 },
                                        { stat: 'energy', delta: 3 }
                                    ]
                                },
                            },
                        });
                    }
                });
            }

            setCurrentInteractableArea(null);
        }

        dispatch({
            type: 'UPDATE_INFO_BAR_LOCATION',
            payload: `Lokasi: ${currentInteractableArea?.locationText || 'Pantai'}`
        });
    };

    const finishActivity = () => {
        const activityData = ACTIVITY_CONFIG[currentActivity];
        if (!activityData) return;

        activityData.effects.forEach(effect => {
            dispatch({ type: 'UPDATE_STATUS_DELTA', stat: effect.stat, delta: effect.delta });
        });

        dispatch({
            type: 'UPDATE_INFO_BAR_LOCATION',
            payload: `Lokasi: ${currentInteractableArea?.locationText || 'Pantai'}`
        });

        setIsLoadingActivity(false);
        setCurrentActivity(null);
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

                {isLoadingActivity && currentActivity && (
                    <ActivityLoadingScreen
                        duration={ACTIVITY_CONFIG[currentActivity].duration}
                        message={ACTIVITY_CONFIG[currentActivity].message}
                        gifUrl={ACTIVITY_CONFIG[currentActivity].gifUrl}
                        onFinish={finishActivity}
                        showFastForward={true}
                    />
                )}

                <Player
                    initialX={500}
                    initialY={200}
                    bounds={pantaiBounds}
                    onPositionChange={handlePlayerPositionChange}
                    spriteWidth={100}
                    spriteHeight={150}
                />

                {currentInteractableArea && currentInteractableArea.actions && playerPosition && !isLoadingActivity && (
                    <div
                        className="absolute z-[1000]"
                        style={{
                            left: `${currentInteractableArea.rect.x + currentInteractableArea.rect.width / 2}px`,
                            top: `${currentInteractableArea.rect.y + 30 - currentInteractableArea.actions.length * 40}px`,
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

                {/* Debug interaction area borders */}
                {INTERACTION_AREAS_PANTAI.map(area => (
                    <div
                        key={area.id}
                        className={`absolute border-[2px] border-dashed flex justify-center items-center ${currentInteractableArea?.id === area.id ? 'border-yellow-400 bg-yellow-400 bg-opacity-30' : 'border-green-500 bg-green-500 bg-opacity-20'}`}
                        style={{
                            left: `${area.rect.x}px`,
                            top: `${area.rect.y}px`,
                            width: `${area.rect.width}px`,
                            height: `${area.rect.height}px`
                        }}
                    >
                        <span className="text-white text-[30px]">!</span>
                    </div>
                ))}

                <Map onNavigateStart={showTransitionGelap} />
                <ArrowControls />
                <InventoryBag />
            </div>
        </ScreenTransition>
    );
};

export default PantaiScreen;
