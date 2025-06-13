import React, { useContext } from 'react';
import { GameContext } from '../contexts/GameContext'; // Adjust path as needed

const ArrowControls = () => {
    const { dispatch } = useContext(GameContext);

    const handleInteractionStart = (direction) => {
        console.log(`Dispatching ARROW_KEY_DOWN for ${direction}`); // Debug
        dispatch({ type: 'ARROW_KEY_DOWN', payload: direction });
    };

    const handleInteractionEnd = (direction) => {
        console.log(`Dispatching ARROW_KEY_UP for ${direction}`); // Debug
        dispatch({ type: 'ARROW_KEY_UP', payload: direction });
    };

    // Base Tailwind classes for the arrow buttons
    const arrowBaseStyle = "arrow w-[40px] h-[40px] md:w-[50px] md:h-[50px] text-xl md:text-2xl font-bold bg-black bg-opacity-60 text-white border-2 border-white rounded-[10px] transition-colors duration-200 ease-in-out hover:bg-white hover:bg-opacity-20 active:bg-blue-500 active:bg-opacity-50 flex justify-center items-center select-none pointer-events-auto focus:outline-none";

    return (
        <div
            id="arrow-controls"
            className="fixed bottom-4 left-4 md:bottom-5 md:left-5 z-[1000] flex flex-col items-center gap-1 md:gap-1.5 pointer-events-auto"
        >
            <button
                className={`${arrowBaseStyle} up`}
                onMouseDown={() => handleInteractionStart('up')}
                onMouseUp={() => handleInteractionEnd('up')}
                onTouchStart={(e) => { e.preventDefault(); handleInteractionStart('up'); }}
                onTouchEnd={(e) => { e.preventDefault(); handleInteractionEnd('up'); }}
                data-direction="up"
            >
                ▲
            </button>
            <div className="horizontal flex gap-10 md:gap-[60px]">
                <button
                    className={`${arrowBaseStyle} left`}
                    onMouseDown={() => handleInteractionStart('left')}
                    onMouseUp={() => handleInteractionEnd('left')}
                    onTouchStart={(e) => { e.preventDefault(); handleInteractionStart('left'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleInteractionEnd('left'); }}
                    data-direction="left"
                >
                    ◀
                </button>
                <button
                    className={`${arrowBaseStyle} right`}
                    onMouseDown={() => handleInteractionStart('right')}
                    onMouseUp={() => handleInteractionEnd('right')}
                    onTouchStart={(e) => { e.preventDefault(); handleInteractionStart('right'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleInteractionEnd('right'); }}
                    data-direction="right"
                >
                    ▶
                </button>
            </div>
            <button
                className={`${arrowBaseStyle} down`}
                onMouseDown={() => handleInteractionStart('down')}
                onMouseUp={() => handleInteractionEnd('down')}
                onTouchStart={(e) => { e.preventDefault(); handleInteractionStart('down'); }}
                onTouchEnd={(e) => { e.preventDefault(); handleInteractionEnd('down'); }}
                data-direction="down"
            >
                ▼
            </button>
        </div>
    );
};

export default ArrowControls;