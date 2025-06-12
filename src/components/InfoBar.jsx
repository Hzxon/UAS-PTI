import React, { useContext } from 'react';
import { GameContext } from '../contexts/GameContext'; // Adjust path as needed

const InfoBar = () => {
    const { gameState } = useContext(GameContext);

    const getGreeting = () => {
        const hour = gameState.gameHour;
        const playerName = gameState.playerName || "Player"; // Fallback if playerName is not set
        let greetingText = "Selamat Malam"; //
        if (hour >= 5 && hour < 11) greetingText = "Selamat Pagi"; //
        else if (hour >= 11 && hour < 15) greetingText = "Selamat Siang"; //
        else if (hour >= 15 && hour < 19) greetingText = "Selamat Sore"; //
        return `~${greetingText} ${playerName}~`; //
    };

    const formatTime = () => {
        const hour = gameState.gameHour.toString().padStart(2, '0');
        const minute = gameState.gameMinute.toString().padStart(2, '0');
        return `${hour}:${minute}`; //
    };

    const formatDay = () => {
        const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"]; //
        // Assuming gameDay starts at 1 for Day 1, and dayNames[1] is Senin for Day 1 (gameDay % 7 could be 1 for Senin)
        // If Day 1 is Senin, then (gameState.gameDay -1) % 7 might map better if dayNames[0] is Minggu
        // Let's adjust to make Day 1 = Senin. If gameState.gameDay = 1, (1 % 7) = 1 which is Senin.
        const currentDayName = dayNames[gameState.gameDay % 7]; //
        return `${currentDayName}, Day ${gameState.gameDay}`; //
    };

    // Use the infoBarLocationText from context if available, otherwise use current logical location
    const displayLocation = gameState.infoBarLocationText || gameState.currentLocation || "Unknown Location";

    return (
        <div
            id="info-bar"
            // Styling from #info-bar in style.css
            // And #arena-top for font family context
            className="bg-black bg-opacity-50 pt-3 md:pt-1 md:pb-2 flex flex-col md:flex-row justify-center items-center text-center md:space-x-4 font-utama text-xs sm:text-sm text-white select-none"
        >
            <span id="greetingText" className="mb-1 md:mb-0">{getGreeting()}</span>
            <span className="hidden md:inline">|</span>
            <span id="location" className="mb-1 md:mb-0">Lokasi: {displayLocation}</span> {/* */}
            <span className="hidden md:inline">|</span>
            <span id="game-day-time" className="mb-1 md:mb-0">{formatDay()} ~ {formatTime()}</span> {/* Merged for better flow */}
            <span className="hidden md:inline">|</span>
            <span id="uang-player">Rp. {gameState.money.toLocaleString('id-ID')}~</span> {/* */}
        </div>
    );
};

export default InfoBar;