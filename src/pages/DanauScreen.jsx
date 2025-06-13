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
    swim: {
        duration: 12000,
        message: 'Sedang berenang di danau...',
        gifUrl: '/images/gambar/animasiBerenang.gif',
        effects: [
            { stat: 'happiness', delta: 20 },
            { stat: 'energy', delta: -5 },
            { stat: 'hygiene', delta: -3 },
            { stat: 'hunger', delta: -5},
        ],
    },
    fishing: {
        duration: 9000,
        message: 'Sedang memancing...',
        gifUrl: '/images/gambar/animasiMancing.gif',
        effects: [
            { stat: 'happiness', delta: 10 },
            { stat: 'energy', delta: -10 },
            { stat: 'hygiene', delta: -5},
            { stat: 'hunger', delta: -5},
        ],
        cost: -200
    },
    jetski: {
        duration: 10000,
        message: 'Sedang main jetski...',
        gifUrl: '/images/gambar/animasiJetski.gif',
        effects: [
            { stat: 'happiness', delta: 25 },
            { stat: 'energy', delta: -15 },
            { stat: 'hygiene', delta: -5},
            { stat: 'hunger', delta: -5},
        ],
        cost: -200
    },
};

const INTERACTION_AREAS_DANAU = [
    {
        id: 'swim',
        name: 'Swimming Area',
        rect: { x: 650, y: 680, width: 200, height: 40 },
        locationText: "Berenang di Danau",
        actions: [
            {
                text: 'Berenang',
                activityKey: 'swim'
            }
        ]
    },
    {
        id: 'fishing',
        name: 'Fishing Spot',
        rect: { x: 300, y: window.innerHeight - 100 - 130, width: 345, height: 130 },
        locationText: "di Spot Memancing",
        actions: [
            {
                text: 'Mancing (Dapat Rp 200)',
                activityKey: 'fishing'
            }
        ]
    },
    {
        id: 'bar',
        name: 'Soda Bar',
        rect: { x: 650, y: window.innerHeight - 440 - 100, width: 220, height: 150 },
        locationText: "di Soda Bar Danau",
        actions: [
            {
                text: 'Beli Soda (Rp 20)',
                cost: 20,
                effects: [{ special: 'sodaBotol' }]
            },
            {
                text: 'Beli Makanan (Rp 50)',
                cost: 50,
                effects: [
                    { stat: 'hunger', delta: 30 },
                    { stat: 'happiness', delta: 5 }
                ]
            }
        ]
    },
    {
        id: 'jetski',
        name: 'Jetski Rental',
        rect: { x: window.innerWidth - 250 - 250, y: 250, width: 250, height: 200 },
        locationText: "di Jetski Rental",
        actions: [
            {
                text: 'Sewa Jetski (Rp 150)',
                activityKey: 'jetski'
            }
        ]
    },
];

const DanauScreen = () => {
    const { gameState, dispatch } = useContext(GameContext);
    const [playerPosition, setPlayerPosition] = useState(null);
    const [currentInteractableArea, setCurrentInteractableArea] = useState(null);
    const [isActivityInProgress, setIsActivityInProgress] = useState(false);
    const [currentActivity, setCurrentActivity] = useState(null);
    const transitionGelapRef = useRef(null);

    useEffect(() => {
        dispatch({ type: 'SET_LOCATION', payload: 'Danau' });
    }, [dispatch]);

    const handlePlayerPositionChange = useCallback((newPosition) => {
        setPlayerPosition(newPosition);
        const intersectedArea = INTERACTION_AREAS_DANAU.find(area => (
            newPosition.x + newPosition.width > area.rect.x &&
            newPosition.x < area.rect.x + area.rect.width &&
            newPosition.y + newPosition.height > area.rect.y &&
            newPosition.y < area.rect.y + area.rect.height
        ));
        setCurrentInteractableArea(intersectedArea || null);
    }, []);

    const startActivity = (activityKey) => {
        const config = ACTIVITY_CONFIG[activityKey];
        if (!config) return;

        // Check cost if defined
        if (config.cost && config.cost > 0 && gameState.money < config.cost) {
            alert(`Uang tidak cukup! Dibutuhkan Rp ${config.cost}, kamu memiliki Rp ${gameState.money}`);
            return;
        }

        // Deduct cost if applicable
        if (config.cost) {
            dispatch({ type: 'UPDATE_MONEY', amount: -config.cost });
        }

        setIsActivityInProgress(true);
        setCurrentActivity(config);
    };

    const handleFinishActivity = () => {
        // Apply effects
        currentActivity.effects.forEach(effect => {
            dispatch({ type: 'UPDATE_STATUS_DELTA', stat: effect.stat, delta: effect.delta });
        });

        setIsActivityInProgress(false);
        setCurrentActivity(null);
        setCurrentInteractableArea(null);
    };

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
                } else if (effect.special === 'sodaBotol') {
                    dispatch({
                        type: 'ADD_ITEM',
                        payload: {
                            name: 'SODA',
                            desc: 'Minuman bersoda menyegarkan!',
                            kelangkaan: 'Umum',
                            image: '/images/objek/sodaBotol.png',
                            usable: true,
                            useAction: {
                                label: "Minum",
                                effects: [
                                    { stat: 'hunger', delta: 6 },
                                    { stat: 'happiness', delta: 20 },
                                    { stat: 'energy', delta: 10 },
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
            payload: `Lokasi: ${currentInteractableArea?.locationText || 'Danau'}`
        });
    };

    const danauBounds = {
        minX: 580,
        maxX: window.innerWidth - 0,
        minY: 300,
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
            <div className="relative w-screen h-screen overflow-hidden bg-[url('/images/gambar/danau.png')] bg-cover bg-center font-utama">
                <div
                    ref={transitionGelapRef}
                    className="fixed top-0 left-0 w-full h-full bg-black opacity-0 pointer-events-none transition-opacity duration-500 ease-in-out z-[1003]"
                ></div>

                <div id="arena-top" className="fixed top-0 left-0 w-full z-[100]">
                    <StatusBar />
                    <InfoBar />
                </div>

                <Player
                    initialX={1300}
                    initialY={400}
                    bounds={danauBounds}
                    onPositionChange={handlePlayerPositionChange}
                    spriteWidth={250}
                    spriteHeight={250}
                    flipped={true}
                />

                {currentInteractableArea && currentInteractableArea.actions && playerPosition && (
                    <div
                        className="absolute z-[1000] pointer-events-auto"
                        style={{
                            left: `${currentInteractableArea.rect.x + currentInteractableArea.rect.width / 2}px`,
                            top: `${currentInteractableArea.rect.y - 30 - currentInteractableArea.actions.length * 40}px`,
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

                {INTERACTION_AREAS_DANAU.map(area => (
                    <div key={area.id} 
                        className={`absolute border-[2px] border-dashed flex justify-center items-center ${currentInteractableArea?.id === area.id ? 'border-yellow-400 bg-yellow-400 bg-opacity-30' : 'border-green-500 bg-green-500 bg-opacity-20'}`}
                        style={{ 
                            left: `${area.rect.x}px`,
                            top: `${area.rect.y}px`,
                            width: `${area.rect.width}px`,
                            height: `${area.rect.height}px`
                            }}>

                        <span className="text-white text-[30px]">!</span>
                    </div>
                ))}

                <Map onNavigateStart={showTransitionGelap} />
                <ArrowControls />
                <InventoryBag />

                {isActivityInProgress && currentActivity && (
                    <ActivityLoadingScreen
                        duration={currentActivity.duration}
                        message={currentActivity.message}
                        gifUrl={currentActivity.gifUrl}
                        onFinish={handleFinishActivity}
                    />
                )}
            </div>
        </ScreenTransition>
    );
};

export default DanauScreen;
