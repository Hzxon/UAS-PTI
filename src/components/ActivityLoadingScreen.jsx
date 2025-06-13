import React, { useEffect, useState } from 'react';

const ActivityLoadingScreen = ({ duration = 3000, message = 'Melakukan aktivitas...', onFinish }) => {
    const [remainingTime, setRemainingTime] = useState(duration / 1000);

    // Countdown setiap 1 detik
    useEffect(() => {
        const interval = setInterval(() => {
            setRemainingTime(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // Jalankan onFinish ketika waktu habis
    useEffect(() => {
        if (remainingTime === 0 && onFinish) {
            onFinish();
        }
    }, [remainingTime, onFinish]);

    // Fast forward manual
    const handleFastForward = () => {
        if (onFinish) {
            onFinish();
        }
    };

    return (
        <div className="fixed inset-0 z-[1005] bg-black bg-opacity-90 flex flex-col items-center justify-center text-white font-utama">
            <div className="text-3xl mb-4 animate-pulse">{message}</div>
            <div className="text-lg mb-6">Selesai dalam {remainingTime} detik...</div>
            <button
                onClick={handleFastForward}
                className="bg-yellow-400 text-black font-bold py-2 px-4 rounded hover:bg-yellow-500 transition"
            >
                Fast Forward
            </button>
        </div>
    );
};

export default ActivityLoadingScreen;
