import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GameContext } from '../contexts/GameContext'; // Adjust path as needed

// Define location data including costs and time changes
// This could also come from a config file or GameContext if it's dynamic
const LOCATIONS_DATA = {
    rumah: { name: 'Rumah', path: '/rumah', cost: 0, timeHours: 0, timeDays: 0, tooltip: "Balik Ke Rumah" }, //
    gunung: { name: 'Gunung', path: '/gunung', cost: 100, timeHours: 0, timeDays: 1, tooltip: "Pergi Ke Gunung (Rp. 100)" }, // Costs vary per originating page in original, this is a simplification. You might need to adjust costs dynamically.
    pantai: { name: 'Pantai', path: '/pantai', cost: 50, timeHours: 5, timeDays: 0, tooltip: "Pergi Ke Pantai (Rp. 50)" }, //
    danau: { name: 'Danau', path: '/danau', cost: 150, timeHours: 8, timeDays: 0, tooltip: "Pergi Ke Danau (Rp. 150)" }, //
    billiard: { name: 'Billiard', path: '/billiard', cost: 400, timeHours: 0, timeDays: 1, tooltip: "Pergi Ke Kota Untuk Main Biliard (Rp. 400)" } //
};
// The original game has dynamic costs/time based on the *current* page.
// For example, going to Rumah from Gunung costs 100 and adds 1 day.
// Going to Rumah from Billiard costs 400 and adds 1 day.
// This simplified LOCATIONS_DATA assumes a base cost. You might need a more complex cost matrix or function
// if you want to replicate the exact dynamic costs from each location.


const Map = ({ onNavigateStart }) => {
    const [isMapOpen, setIsMapOpen] = useState(false);
    const { gameState, dispatch } = useContext(GameContext);
    const navigate = useNavigate();
    const reactLocation = useLocation(); // To get current path

    const [currentMapLocationKey, setCurrentMapLocationKey] = useState('rumah');

    useEffect(() => {
        // Update current location marker based on route
        const currentPath = reactLocation.pathname;
        const newLocationKey = Object.keys(LOCATIONS_DATA).find(key => LOCATIONS_DATA[key].path === currentPath) || 'rumah';
        setCurrentMapLocationKey(newLocationKey);
    }, [reactLocation.pathname]);


    const handleOpenMap = () => {
        setIsMapOpen(true);
        // Original CSS has a blur effect, which is harder to replicate directly on the #root or body
        // For now, we'll just show the map overlay.
        // document.getElementById('blur')?.classList.add('muncul'); // (This was for a canvas blur)
    };

    const handleCloseMap = () => {
        setIsMapOpen(false);
        // document.getElementById('blur')?.classList.remove('muncul'); //
    };

    const handleLocationClick = (locationKey) => {
        const destination = LOCATIONS_DATA[locationKey];
        if (!destination) return;

        // Prevent navigating to the current location
        if (reactLocation.pathname === destination.path) {
            handleCloseMap();
            return;
        }
        
        // Simplified cost - original game had dynamic costs based on current location
        // You might need a function: getTravelCost(currentLocationKey, destinationKey)
        const travelCost = destination.cost; // Using the base cost for now

        if (gameState.money < travelCost) {
            alert("Uang tidak cukup untuk pergi ke " + destination.name + "!");
            return;
        }

        if (onNavigateStart) {
            onNavigateStart(); // Trigger screen transition out
        }

        // Deduct money and advance time
        dispatch({ type: 'UPDATE_MONEY', amount: -travelCost });
        if (destination.timeHours > 0) {
            dispatch({ type: 'ADVANCE_TIME', hours: destination.timeHours });
        }
        if (destination.timeDays > 0) {
            // ADVANCE_TIME should be able to handle advancing days directly or by hours
            dispatch({ type: 'ADVANCE_TIME', hours: destination.timeDays * 24 });
        }
        
        // Save current stats to localStorage before navigating (handled by GameContext's useEffect)

        setTimeout(() => {
            navigate(destination.path);
            handleCloseMap(); // Close map after navigation starts
        }, 500); // Wait for transition
    };

    // Define positions for buttons and character markers on the map image
    // These are % based on the map image dimensions (e.g., map-besar.png)
    // You'll need to precisely adjust these.
    const mapButtonPositions = {
        rumah: { top: '35%', left: '30%' }, // Approximate, from style.css #karakter-rumah, .rumah
        gunung: { top: '35%', right: '30%' }, // Approximate, from style.css #karakter-gunung, .gunung
        pantai: { bottom: '20%', left: '28%' }, // Approximate, from style.css #karakter-pantai, .pantai
        danau: { bottom: '35%', right: '39%' }, // Approximate, from style.css #karakter-danau, .danau
        billiard: { bottom: '10%', right: '5%' }, // Approximate, from style.css #karakter-beel, .beel
    };


    return (
        <>
            {/* Small Map Icon */}
            <img
                id="map-kecil"
                src="/images/objek/map-kecil.png" // Path relative to public folder
                alt="Buka Peta"
                className="fixed w-[100px] md:w-[150px] cursor-pointer bottom-5 md:bottom-[30px] right-5 md:right-[30px] z-[1000] transition-all duration-1000 hover:w-[120px] md:hover:w-[180px]" //
                onClick={handleOpenMap}
            />

            {/* Large Map Modal */}
            {isMapOpen && (
                <>
                    {/* Blur effect overlay (optional, could be a semi-transparent div) */}
                    <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-[1001]"></div> {/* Mimics .blur.muncul opacity */}

                    <div id="buka-map" className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[1002]"> {/* */}
                        <div id="map-besar" className="relative w-full max-w-[700px] md:max-w-[900px]"> {/* */}
                            <img id="map-image" src="/images/objek/map-besar.png" alt="Peta Besar" className="w-full" /> {/* */}

                            {/* Tutup Button */}
                            <button
                                className="tutup-map absolute top-[10px] right-0 md:right-[0px] py-1 px-2 md:py-2 md:px-3 bg-transparent border-none rounded-[5px] cursor-pointer font-utama font-bold text-2xl md:text-3xl text-gray-500 hover:text-gray-700" //
                                onClick={handleCloseMap}
                            >
                                X
                            </button>

                            {/* Location Buttons and Character Markers */}
                            {Object.keys(LOCATIONS_DATA).map((key) => {
                                const location = LOCATIONS_DATA[key];
                                const positionStyle = mapButtonPositions[key] || {};
                                const isCurrentLocation = currentMapLocationKey === key;

                                return (
                                    <React.Fragment key={key}>
                                        {/* Character Marker */}
                                        {isCurrentLocation && gameState.characterSprite && (
                                            <img
                                                src={gameState.characterSprite} // Use the chosen character sprite
                                                alt="Karakter Anda"
                                                className="absolute w-[30px] md:w-[40px] pointer-events-none" // for #karakter-* IDs
                                                style={{
                                                    ...positionStyle,
                                                    // Adjust position slightly if button and marker overlap too much
                                                    transform: 'translate(-50%, -60%)' // Position character above the button center
                                                }}
                                            />
                                        )}

                                        {/* Location Button with Tooltip */}
                                        {!isCurrentLocation && ( // Hide button for current location as per original HTML
                                            <button
                                                className={`map-location-btn absolute font-utama text-red-600 text-4xl md:text-5xl font-bold bg-transparent border-none cursor-pointer group ${isCurrentLocation ? 'hidden' : ''}`} // for .rumah, .gunung etc.
                                                style={{
                                                    ...positionStyle,
                                                    transform: 'translate(-50%, -50%)' // Center button on the coordinates
                                                }}
                                                onClick={() => handleLocationClick(key)}
                                            >
                                                <span className="tanda animate-blink">!</span> {/* */}
                                                <span
                                                    className="tooltip-text absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-xs px-2 py-1 bg-red-600 border-2 border-black text-white text-center text-xs md:text-sm rounded-[4px] z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none whitespace-nowrap" //
                                                >
                                                    {location.tooltip}
                                                </span>
                                            </button>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}
        </>
    );
};

export default Map;