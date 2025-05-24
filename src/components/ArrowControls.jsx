import React, { useContext } from 'react';
import { GameContext } from '../contexts/GameContext'; // Adjust path as needed

const ArrowControls = () => {
    const { dispatch } = useContext(GameContext);

    const handleInteractionStart = (direction) => {
        dispatch({ type: 'ARROW_KEY_DOWN', payload: direction });
    };

    const handleInteractionEnd = (direction) => {
        dispatch({ type: 'ARROW_KEY_UP', payload: direction });
    };

    // Base Tailwind classes for the arrow buttons, derived from style.css
    const arrowBaseStyle = "arrow w-[40px] h-[40px] md:w-[50px] md:h-[50px] text-xl md:text-2xl font-utama font-bold bg-black bg-opacity-60 text-white border-2 border-white rounded-[10px] transition-colors duration-200 ease-in-out hover:bg-white hover:bg-opacity-20 active:bg-opacity-30 flex justify-center items-center select-none";

    return (
        <div
            id="arrow-controls"
            className="fixed bottom-4 left-4 md:bottom-5 md:left-5 z-[997] flex flex-col items-center gap-1 md:gap-1.5" //
        >
            <button
                className={`${arrowBaseStyle} up`}
                onMouseDown={() => handleInteractionStart('up')}
                onMouseUp={() => handleInteractionEnd('up')}
                onTouchStart={(e) => { e.preventDefault(); handleInteractionStart('up'); }} // preventDefault for touch to avoid issues like double tap zoom
                onTouchEnd={(e) => { e.preventDefault(); handleInteractionEnd('up'); }}
                data-direction="up" //
            >
                ▲
            </button>
            <div className="horizontal flex gap-10 md:gap-[60px]"> {/* */}
                <button
                    className={`${arrowBaseStyle} left`}
                    onMouseDown={() => handleInteractionStart('left')}
                    onMouseUp={() => handleInteractionEnd('left')}
                    onTouchStart={(e) => { e.preventDefault(); handleInteractionStart('left'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleInteractionEnd('left'); }}
                    data-direction="left" //
                >
                    ◀
                </button>
                <button
                    className={`${arrowBaseStyle} right`}
                    onMouseDown={() => handleInteractionStart('right')}
                    onMouseUp={() => handleInteractionEnd('right')}
                    onTouchStart={(e) => { e.preventDefault(); handleInteractionStart('right'); }}
                    onTouchEnd={(e) => { e.preventDefault(); handleInteractionEnd('right'); }}
                    data-direction="right" //
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
                data-direction="down" //
            >
                ▼
            </button>
        </div>
    );
};

export default ArrowControls;