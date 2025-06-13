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

const INTERACTION_AREAS_GUNUNG = [
    {
        id: 'nginep', name: 'Penginapan',
        rect: { x: 344, y: 400, width: 60, height: 120 },
        locationText: "di Penginapan",
        actions: [
            { text: 'Menginap (Rp 200)', cost: 200, effects: [{ stat: 'energy', valueSet: 70 }, { stat: 'hygiene', delta: -10 }], timeAdvanceHours: 8, type: 'sleep' },
            { text: 'Nginep + Mandi (Rp 200)', cost: 200, effects: [{ stat: 'energy', valueSet: 100 }, { stat: 'hygiene', valueSet: 40 }], timeAdvanceHours: 9, type: 'sleep_bath' },
            { text: 'Nginep + Mandi + Bonus Handuk 🤫 (Rp 200)', cost: 200, effects: [{ stat: 'energy', valueSet: 100 }, { stat: 'hygiene', valueSet: 40 }, { special: 'malingHanduk' }], timeAdvanceHours: 9, type: 'sleep_bath' },
        ]
    },
    {
        id: 'cafe', name: 'Kafe',
        rect: { x: 665, y: 447, width: 65, height: 80 },
        locationText: "di Kafe Gunung",
        availableDaytimeOnly: true,
        actions: [
            { text: 'Beli Nasi Goreng (Rp 40)', cost: 40, effects: [{ stat: 'hunger', delta: 20 }, { stat: 'happiness', delta: 10 }, { stat: 'energy', delta: -5 }, { stat: 'hygiene', delta: -10 }], timeAdvanceHours: 1 },
            { text: 'Beli Es Teh Manis (Rp 15)', cost: 15, effects: [{ stat: 'hunger', delta: 5 }, { stat: 'happiness', delta: 15 }, { stat: 'energy', delta: 3 }, { stat: 'hygiene', delta: -10 }] },
            { text: 'Bungkus Nasi Goreng (Rp 40)', cost: 40, effects: [{ special: 'nasiGoreng' }] },
            { text: 'Beli Aqua Botol (Rp 8)', cost: 8, effects: [{ special: 'aquaBotol' }] },
            { text: 'Beli Kopi (Rp 20)', cost: 25, effects: [{ stat: 'hunger', delta: 5 }, { stat: 'happiness', delta: 30 }, { stat: 'energy', delta: 30 }, { stat: 'hygiene', delta: -10 }] },
        ]
    },
    {
        id: 'sovenir', name: 'Toko Sovenir',
        rect: { x: window.innerWidth - 630, y: window.innerHeight - 350, width: 360, height: 200 },
        locationText: "di Toko Sovenir",
        availableDaytimeOnly: true,
        actions: [
            { text: 'Beli Sovenir (Rp 50)', cost: 50, effects: [{ stat: 'happiness', special: 'sovenirHappiness' }], type: 'buy_sovenir' },
        ]
    },
    {
        id: 'foto', name: 'Spot Foto',
        rect: { x: 535, y: window.innerHeight - 115, width: 90, height: 50 },
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
    const [newItem, setNewItem] = useState(null);
    const [isLoadingActivity, setIsLoadingActivity] = useState(false);

    const transitionGelapRef = useRef(null);
    const isMalam = gameState.gameHour >= 18 || gameState.gameHour < 6;

    const gunungBounds = { minX: 100, maxX: 950, minY: 390, maxY: 620 };

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
        const { text, cost, effects, timeAdvanceHours, type } = action;
        if (gameState.money < cost) {
            alert("Uang tidak cukup!");
            return;
        }

        if (text === "Beli Kopi (Rp 20)") {
                setIsLoadingActivity(true);
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
                    }else if(effect.special === 'malingHanduk'){
                        dispatch({
                                type: 'ADD_ITEM',
                                payload: {
                                    name: 'HANDUK PENGINAPAN',
                                    desc: 'Dijual bisa kali y 🤓 (+Rp 5)',
                                    kelangkaan: 'Biasa',
                                    image: '/images/objek/handuk.png',
                                    usable: true,
                                    useAction: {
                                        label: "Jual",
                                        effects: [{ stat: "money", delta: 5 }, { stat: "hygiene", delta: -50 }],
                                    },
                                },
                        });
                    }else if(effect.special === 'nasiGoreng'){
                        dispatch({
                                type: 'ADD_ITEM',
                                payload: {
                                    name: 'NASI GORENG',
                                    desc: 'Enak',
                                    kelangkaan: 'Umum',
                                    image: '/images/objek/nasiGoreng.png',
                                    usable: true,
                                    useAction: {
                                        label: "Makan",
                                        effects: [{ stat: 'hunger', delta: 20 }, { stat: 'happiness', delta: 5 }, { stat: 'energy', delta: 10 }, { hygiene: '-10'} ]
                                    },
                                },
                        });
                    }else if(effect.special === 'aquaBotol'){
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
                    }else if (effect.special === 'sovenirHappiness') {
                        let hapDelta = 30;
                        if (sovenirPurchaseCount === 1) hapDelta = 10;
                        else if (sovenirPurchaseCount >= 2) hapDelta = -10;
                        dispatch({ type: 'UPDATE_STATUS_DELTA', stat: 'happiness', delta: hapDelta });
                        setSovenirPurchaseCount(prev => prev + 1);
                        dispatch({
                                type: 'ADD_ITEM',
                                payload: {
                                    name: 'KACAMATA',
                                    desc: 'Kenangan dari gunung 😁 (+Rp 60)',
                                    kelangkaan: 'Biasa',
                                    image: '/images/objek/Kacamata.png',
                                    usable: true,
                                    useAction: {
                                        label: "Jual",
                                        effects: [{ stat: 'money', delta: 60 }]
                                    },
                                },
                        });
                    } else if (effect.special === 'fotoHappiness') {
                        let hapDelta = 50;
                        if (photoViewCount === 1) hapDelta = 0;
                        else if (photoViewCount >= 2) hapDelta = -50;
                        dispatch({ type: 'UPDATE_STATUS_DELTA', stat: 'happiness', delta: hapDelta });
                        setPhotoViewCount(prev => prev + 1);
                        if (photoViewCount < 1){
                            dispatch({
                                type: 'ADD_ITEM',
                                payload: {
                                    name: 'FOTO GUNUNG',
                                    desc: 'Kenangan dari gunung (Hanya bisa didapatkan 1x dan tidak bisa didapatkan lagi)',
                                    kelangkaan: 'Sangat Langka',
                                    image: '/images/gambar/foto-gunung.png',
                                    usable: true,
                                    useAction: {
                                        label: "Lihat",
                                        modalImage: "/images/gambar/foto-gunung.png"
                                    },
                                },
                            });
                        }
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

    useEffect(() => {
        const handleUnload = () => {
            localStorage.removeItem('inventoryItems');
        };
    
        window.addEventListener('beforeunload', handleUnload);
        return () => {
            window.removeEventListener('beforeunload', handleUnload);
        };
    }, []);


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
                    spriteWidth={150}
                    spriteHeight={150}
                />

                {currentInteractableArea && currentInteractableArea.actions && playerPosition && (
                    <div className="absolute z-[1000] pointer-events-auto" 
                    style={{
                        left: `${currentInteractableArea.rect.x + currentInteractableArea.rect.width / 2}px`,
                        top: `${currentInteractableArea.rect.y - 30 - currentInteractableArea.actions.length * 40}px`,
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

                {INTERACTION_AREAS_GUNUNG.map(area => {
                    if (area.availableDaytimeOnly && isMalam) return null;
                    return (
                    <div key={area.id} className={`absolute border-[2px] border-dashed flex justify-center items-center ${currentInteractableArea?.id === area.id ? 'border-yellow-400 bg-yellow-400 bg-opacity-30' : 'border-green-500 bg-green-500 bg-opacity-20'}`}
                        style={{ left: `${area.rect.x}px`, top: `${area.rect.y}px`, width: `${area.rect.width}px`, height: `${area.rect.height}px` }}>
                        <span className="text-white text-[30px]">!{/*{area.name} {area.availableDaytimeOnly && "(Siang)"}*/}</span>
                    </div>
                )})}

                {showPhotoModal && (
                    <div id="lihat-foto" className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[1005] bg-black bg-opacity-70">
                        <div id="isi-foto" className="relative bg-center bg-no-repeat bg-cover">
                            <img id="pemandangan" src="/images/gambar/foto-gunung.png" alt="Pemandangan Gunung" className="w-full" />
                            <button
                                className="z-[1006] tutup-foto fixed bottom-5 right-5 w-[100px] py-2 px-3 bg-[#ffcf40] border-none rounded-md shadow-md cursor-pointer font-utama text-white font-bold text-4xl transition-all duration-1000 hover:w-[120px] hover:bg-[#d29e00] hover:border-2 hover:border-black"
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

                {isLoadingActivity && (
                    <ActivityLoadingScreen
                        duration={6000} 
                        message="Sedang memikirkan masa depan negeri..."
                        gifUrl='/images/gambar/ngopi.gif'
                        onFinish={() => {
                            dispatch({ type: 'UPDATE_STATUS_DELTA', stat: 'hunger', delta: 5 });
                            dispatch({ type: 'UPDATE_STATUS_DELTA', stat: 'energy', delta: 30 });
                            dispatch({ type: 'UPDATE_STATUS_DELTA', stat: 'happiness', delta: 30 });
                            dispatch({ type: 'UPDATE_STATUS_DELTA', stat: 'hygiene', delta: -10 });
                            dispatch({ type: 'UPDATE_MONEY', amount: -20 });
                            dispatch({ type: 'ADVANCE_TIME', hours: 1 });

                            setIsLoadingActivity(false);
                            setCurrentInteractableArea(null);
                        }}
                    />
                )}

                <Map onNavigateStart={showPageTransition} />
                <ArrowControls />
                <InventoryBag />
            </div>
        </ScreenTransition>
    );
};

export default GunungScreen;