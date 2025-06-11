import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { GameContext } from '../contexts/GameContext.jsx'; // Adjust path as needed

// Define your avatar and character assets
// In a real app, you might want to manage this list more dynamically or in a config file
const AVATARS = [
    { avatarSrc: '/images/avatar/avatar1.png', characterSrc: '/images/karakter/karakter1.gif' }, // Paths relative to your public folder or imported
    { avatarSrc: '/images/avatar/avatar2.png', characterSrc: '/images/karakter/karakter2.gif' },
    { avatarSrc: '/images/avatar/avatar3.png', characterSrc: '/images/karakter/karakter3.gif' },
    { avatarSrc: '/images/avatar/avatar4.png', characterSrc: '/images/karakter/karakter4.gif' },
];

const MainMenuScreen = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [playerName, setPlayerName] = useState('');
    const [nameError, setNameError] = useState('');
    const { dispatch } = useContext(GameContext);
    const navigate = useNavigate();

    const clickSoundRef = useRef(null);
    const inputSuccessSoundRef = useRef(null);
    const inputFailSoundRef = useRef(null);
    const bgMusicRef = useRef(null);

    // Refs for transition effect
    const transitionOutRef = useRef(null);

    useEffect(() => {
        // Preload audio
        if (clickSoundRef.current) clickSoundRef.current.load();
        if (inputSuccessSoundRef.current) inputSuccessSoundRef.current.load();
        if (inputFailSoundRef.current) inputFailSoundRef.current.load();
        if (bgMusicRef.current) bgMusicRef.current.load();
    }, []);

    const playClickSound = () => {
        if (clickSoundRef.current) {
            clickSoundRef.current.currentTime = 0;
            clickSoundRef.current.play().catch(error => console.log("Error playing click sound:", error));
        }
    };

    const playInputSuccessSound = () => {
        if (inputSuccessSoundRef.current) {
            inputSuccessSoundRef.current.currentTime = 0;
            inputSuccessSoundRef.current.play().catch(error => console.log("Error playing success sound:", error));
        }
    };

    const playInputFailSound = () => {
        if (inputFailSoundRef.current) {
            inputFailSoundRef.current.currentTime = 0;
            inputFailSoundRef.current.play().catch(error => console.log("Error playing fail sound:", error));
        }
    };

    const handlePlayBgMusic = () => {
         if (bgMusicRef.current && bgMusicRef.current.paused) {
            bgMusicRef.current.volume = 0.5;
            bgMusicRef.current.play().catch(error => console.log("Error playing BG music:", error));
        }
    };

    // Attempt to play background music on first interaction
    useEffect(() => {
        const playMusicOnInteraction = () => {
            handlePlayBgMusic();
            document.removeEventListener('click', playMusicOnInteraction);
            document.removeEventListener('keydown', playMusicOnInteraction);
        };

        document.addEventListener('click', playMusicOnInteraction);
        document.addEventListener('keydown', playMusicOnInteraction);

        return () => {
            document.removeEventListener('click', playMusicOnInteraction);
            document.removeEventListener('keydown', playMusicOnInteraction);
        };
    }, []);


    const handleNextAvatar = () => {
        playClickSound();
        setCurrentIndex((prevIndex) => (prevIndex + 1) % AVATARS.length);
    };

    const handlePrevAvatar = () => {
        playClickSound();
        setCurrentIndex((prevIndex) => (prevIndex - 1 + AVATARS.length) % AVATARS.length);
    };

    const handleNameChange = (e) => {
        setPlayerName(e.target.value);
        if (e.target.value.trim().length >= 4 && e.target.value.trim().length <= 20) {
            setNameError('');
        }
    };

    const validateName = () => {
        const trimmedName = playerName.trim();
        if (trimmedName.length < 4 || trimmedName.length > 20) {
            setNameError('Panjang nama harus 4-20 huruf!'); //
            playInputFailSound();
            return false;
        }
        setNameError('');
        playInputSuccessSound();
        return true;
    };

    const handleStartGame = () => {
        handlePlayBgMusic(); // Ensure music is playing or attempts to play
        if (!validateName()) {
            return;
        }

        dispatch({
            type: 'SET_PLAYER_DEFAULTS',
            payload: {
                name: playerName.trim(),
                sprite: AVATARS[currentIndex].characterSrc,
            },
        });

        // Trigger transition out
        if (transitionOutRef.current) {
            transitionOutRef.current.classList.add('opacity-100', 'pointer-events-auto');
            transitionOutRef.current.classList.remove('opacity-0', 'pointer-events-none');
        }

        setTimeout(() => {
            navigate('/rumah');
        }, 500); // Match transition duration
    };

    return (
        <div className="relative w-screen h-screen items-center justify-center bg-[url('/images/gambar/tampilan-awal-mobile.gif')] md:bg-[url('/images/gambar/tampilan-awal.gif')] bg-cover bg-center bg-fixed font-utama text-white overflow-hidden" onClick={handlePlayBgMusic}>
            {/* Transition Layer */}
            <div
                ref={transitionOutRef}
                className="fixed top-0 left-0 w-full h-full bg-black opacity-0 pointer-events-none transition-opacity duration-500 ease-in-out z-[999]"
            ></div>

            {/* Audio Elements */}
            <audio ref={bgMusicRef} src="/sounds/backsound1.wav" loop preload="auto"></audio> {/* */}
            <audio ref={clickSoundRef} src="/sounds/click.mp3" preload="auto"></audio> {/* */}
            <audio ref={inputSuccessSoundRef} src="/sounds/input-berhasil.wav" preload="auto"></audio> {/* Corrected filename from original source */}
            <audio ref={inputFailSoundRef} src="/sounds/input-gagal.wav" preload="auto"></audio> {/* */}

            {/* Game Title */}
            <h1 className="font-judul text-[#ffcf40] text-center
                text-[45px] mt-[30px] leading-[60px]
                md:text-[70px] md:mt-[60px] md:leading-[100px]" 
                style={{ textShadow: '0px -2px black, 2px 0px black, 0px 6px black, -2px 0px black' }}
                >
                Bjir<br />Work Life Balance
            </h1>

            {/* Avatar Selection */}
            <div className="flex justify-center items-center select-none 
                mt-8 mb-6
                md:mt-8 md:mb-6"
                >
                <button
                    onClick={handlePrevAvatar}
                    className="ganti-avatar cursor-pointer bg-transparent border-none flex justify-center items-center transition-all duration-500 text-[#ffcf40] hover:text-[#ff9d00] text-shadow hover-text-shadow 
                    text-6xl p-0 mx-[30px] my-[0]
                    md:text-7xl md:p-0 md:mx-[30px] md:my-[0]"
                >
                    &lt;
                </button>
                <div className="bg-blue-600 border-[3px] border-black relative 
                    w-[120px] h-[120px]
                    md:w-[150px] md:h-[150px]"
                    >
                    {AVATARS.map((item, index) => (
                        <img
                            key={index}
                            src={item.avatarSrc} // Ensure paths are correct, e.g., relative to public folder
                            alt={`Avatar ${index + 1}`}
                            className={`w-full h-full absolute top-0 left-0 transition-opacity duration-400 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                        />
                    ))}
                </div>
                <button
                    onClick={handleNextAvatar}
                    className="ganti-avatar cursor-pointer bg-transparent border-none flex justify-center items-center transition-all duration-500 text-[#ffcf40] hover:text-[#ff9d00] text-shadow hover-text-shadow 
                    text-6xl p-0 mx-[30px] my-[0]
                    md:text-7xl md:p-0 md:mx-[30px] md:my-[0]"
                >
                    &gt;
                </button>
            </div>

            {/* Name Input and Start Button */}
            <div className="nama-mulai flex flex-col items-center w-full px-4"> {/* */}
                <div className="isi-nama relative flex justify-center my-1 mx-auto"> {/* */}
                    <input
                        type="text"
                        id="nama-pemain"
                        value={playerName}
                        onChange={handleNameChange}
                        onBlur={validateName} // Validate when input loses focus
                        className={`z-[100] flex-grow font-bold text-center border-[3.5px] border-black rounded-[5px] font-utama placeholder-gray-500 text-black 
                        w-[250px] text-[12px] py-3 px-4 my-1 
                        md:w-[280px] md:text-sm md:py-3 md:px-4 md:my-1 
                        ${nameError ? 'bg-[#ffeeee] border-red-500' : 'bg-white'}`} //
                        placeholder="Masukkan Nama"
                    />
                    {nameError && (
                        <div
                            className="warning absolute right-[-25px] md:right-[-30px] top-1/2 -translate-y-1/2 w-[20px] h-[20px] md:w-[25px] md:h-[25px] bg-red-600 text-white font-bold text-xs md:text-sm rounded-full flex justify-center items-center cursor-pointer shadow-md group" //
                            data-tooltip={nameError} //
                        >
                            !
                            <span className="absolute left-full min-w-max p-2 bg-red-600 text-white text-xs rounded-md box-shadow opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap
                                    mx-[-300px] mt-[-100px]
                                    md:ml-2 md:mt-[0]"
                            >
                                {nameError}
                            </span>
                        </div>
                    )}
                </div>
                <button
                    id="mulai"
                    onClick={handleStartGame}
                    className="z-[100] cursor-pointer text-[#ffcf40] text-2xl md:text-3xl w-[200px] md:w-[250px] font-bold py-2 md:py-[10px] my-1 mx-auto border-none bg-transparent duration-500 hover:text-[#ff9d00] text-shadow hover-text-shadow" //
                >
                    Mulai Game
                </button>
            </div>

            {/* Hidden Character Sprites (for preloading or if needed elsewhere, though GameContext handles the chosen one) */}
            <div className="flex z-[10]
                mt-[-65px] mx-[275px]
                md:mt-[-150px] md:mx-[500px]"
                >
                {AVATARS.map((item, index) => (
                    <img key={index} src={item.characterSrc} alt="" 
                        className={`fixed transition-all duration-400 ease-in-out
                            w-[85px] 
                            md:w-[95px]
                            ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`} />
                ))}
            </div>
        </div>
    );

};

export default MainMenuScreen;