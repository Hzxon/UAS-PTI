import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // pastikan kamu menggunakan react-router

const ActivityLoadingScreen = ({ duration = 3000, message = 'Melakukan aktivitas...' }) => {
    const navigate = useNavigate();
    const [remainingTime, setRemainingTime] = useState(duration / 1000);

    useEffect(() => {
        const interval = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        const timeout = setTimeout(() => {
            navigate('/'); // ubah ke halaman menu utama yang sesuai
        }, duration);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [duration, navigate]);

    const handleFastForward = () => {
        navigate('/'); // ubah ke halaman menu utama yang sesuai
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
