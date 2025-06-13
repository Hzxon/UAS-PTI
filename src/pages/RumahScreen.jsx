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

const INTERACTION_AREAS_RUMAH = [
    { id: 'bed', name: 'Bed', rect: {x: 60, y: 135, width: 302, height: 305}, 
        actions: [
            {
                text: 'Tidur di Kasur', 
                cost: 0, 
                type: 'sleep',
                effects: [{ stat: 'energy', valueSet: 70, interval: true }, {stat: 'happiness', delta: 1, interval: true}]
            }
        ] 
    }, //
    { id: 'table', name: 'Table', rect: {x: 988, y: 441, width: 222, height: 200}, 
        actions: [
            {
                text: 'Makan di Meja', 
                cost: 0, 
                effects: [{ stat: 'hunger', delta: 1, interval: true }] 
            }
        ]
    }, //
    { id: 'toilet', name: 'Toilet', rect: {x: 645, y: 80, width: 100, height: 100}, 
        actions: [
            {
                text: 'Gunakan Toilet', 
                cost: 0, 
                effects: [{ stat: 'hygiene', delta: 2, interval: true }] 
            }
        ]
    }, //
    { id: 'bathroom', name: 'Bathroom', rect: {x: 1250, y: 170, width: 220, height: 110}, 
        actions: [
            {
                text: 'Mandi', 
                cost: 0, 
                effects: [{ stat: 'hygiene', delta: 3, interval: true }, {stat: 'happiness', delta:1, interval: true}] 
            }
        ]
    }, //
];

const RumahScreen = () => {
    const { gameState, dispatch } = useContext(GameContext);
    const [playerPosition, setPlayerPosition] = useState(null);
    const [currentInteractableArea, setCurrentInteractableArea] = useState(null);
    const transitionGelapRef = useRef(null);

    useEffect(() => {
        dispatch({ type: 'SET_LOCATION', payload: 'Rumah' });
    }, [dispatch]);

    const handlePlayerPositionChange = useCallback((newPosition) => {
        setPlayerPosition(newPosition);
        
        const intersectedArea = INTERACTION_AREAS_RUMAH.find(area => {
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
        
        const { cost, effects, type } = action;

        if (cost > 0 && gameState.money < cost) {
            alert(`Uang tidak cukup! Dibutuhkan Rp ${cost}, kamu memiliki Rp ${gameState.money}`);
            return;
        }

        dispatch({ type: 'UPDATE_MONEY', amount: -cost });

        const needsGelapTransition = type === 'sleep';
        if (needsGelapTransition && transitionGelapRef.current) {
            transitionGelapRef.current.classList.add('opacity-100', 'pointer-events-auto');
            transitionGelapRef.current.classList.remove('opacity-0', 'pointer-events-none');

            setTimeout(() => {
                transitionGelapRef.current.classList.remove('opacity-100', 'pointer-events-auto');
                transitionGelapRef.current.classList.add('opacity-0', 'pointer-events-none');
            }, 1000);
        }

        effects.forEach(effect => {
            if (effect.hasOwnProperty('valueSet')) {
                dispatch({
                    type: 'UPDATE_STAT',
                    stat: effect.stat,
                    value: effect.valueSet
                });
            } else if (effect.hasOwnProperty('delta')) {
                dispatch({
                    type: 'UPDATE_STATUS_DELTA',
                    stat: effect.stat,
                    delta: effect.delta
                });
            }
        });

        dispatch({
            type: 'UPDATE_INFO_BAR_LOCATION',
            payload: `Lokasi: ${currentInteractableArea?.locationText || 'RUMAH'}`
        });

        setCurrentInteractableArea(null);
    };

    const rumahBounds = {
        minX: 50,
        maxX: window.innerWidth - 50,
        minY: 100,
        maxY: window.innerHeight - 50,
    };

    const showTransitionGelap = () => {
        if (transitionGelapRef.current) {
            transitionGelapRef.current.classList.add('opacity-100', 'pointer-events-auto');
            transitionGelapRef.current.classList.remove('opacity-0', 'pointer-events-none');
        }
    };

    return(
        <ScreenTransition>
            <div className="relative w-screen h-screen overflow-hidden bg-[url('/images/gambar/inside-home.png')] bg-cover bg-center font-utama"
                >
                <div
                    ref={transitionGelapRef}
                    className="fixed top-0 left-0 w-full h-full bg-black opacity-0 pointer-events-none transition-opacity duration-500 ease-in-out z-[1003]" //
                ></div>

                <div id="arena-top" className="fixed top-0 left-0 w-full z-[100]">
                    <StatusBar />
                    <InfoBar />
                </div>

                <Player
                    initialX={500}
                    initialY={200}
                    bounds={rumahBounds}
                    onPositionChange={handlePlayerPositionChange}
                    spriteWidth={100}
                    spriteHeight={150}
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

                {INTERACTION_AREAS_RUMAH.map(area => (
                    <div key={area.id} className={`absolute border-[2px] border-dashed flex justify-center items-center ${currentInteractableArea?.id === area.id ? 'border-yellow-400 bg-yellow-400 bg-opacity-30' : 'border-green-500 bg-green-500 bg-opacity-20'}`}
                        style={{ left: `${area.rect.x}px`, top: `${area.rect.y}px`, width: `${area.rect.width}px`, height: `${area.rect.height}px` }}>
                        <span className="text-white text-[30px]">!{/*{area.name}*/}</span>
                    </div>
                ))}

                <Map onNavigateStart={showTransitionGelap} />
                <ArrowControls />
                <InventoryBag />
            </div>
        </ScreenTransition>
    );
};

export default RumahScreen;