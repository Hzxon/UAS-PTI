import React, { useState, useEffect, useRef, useContext } from 'react';
import { GameContext } from '../contexts/GameContext.jsx'; // Adjust path

const Player = ({
    initialX,
    initialY,
    bounds, // { minX, maxX, minY, maxY }
    onPositionChange, // Callback to report position
    speed = 5, // Movement speed
    spriteWidth = 100, // Adjust as per your sprite
    spriteHeight = 100, // Adjust as per your sprite
    flipped = false
}) => {
    const { gameState } = useContext(GameContext);
    const [position, setPosition] = useState({ x: initialX, y: initialY });
    const [isFacingLeft, setIsFacingLeft] = useState(flipped);
    const keysPressed = useRef({});

    const [hasMoved, setHasMoved] = useState(false);

    useEffect(() => {
        setPosition({ x: initialX, y: initialY });
    }, [initialX, initialY]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            keysPressed.current[e.key.toLowerCase()] = true;
        };
        const handleKeyUp = (e) => {
            keysPressed.current[e.key.toLowerCase()] = false;
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        const gameLoop = () => {
            let newX = position.x;
            let newY = position.y;
            let moved = false;

            if (keysPressed.current['w'] || keysPressed.current['arrowup']) {
                newY -= speed;
                moved = true;
            }
            if (keysPressed.current['s'] || keysPressed.current['arrowdown']) {
                newY += speed;
                moved = true;
            }
            if (keysPressed.current['a'] || keysPressed.current['arrowleft']) {
                newX -= speed;
                setIsFacingLeft(true);
                moved = true;
            }
            if (keysPressed.current['d'] || keysPressed.current['arrowright']) {
                newX += speed;
                setIsFacingLeft(false);
                moved = true;
            }

            if (moved) {
                // Apply bounds
                if (bounds) {
                    newX = Math.max(bounds.minX, Math.min(bounds.maxX - spriteWidth, newX));
                    newY = Math.max(bounds.minY, Math.min(bounds.maxY - spriteHeight, newY));
                }

                setPosition({ x: newX, y: newY });
                if (onPositionChange) {
                    onPositionChange({ x: newX, y: newY, width: spriteWidth, height: spriteHeight });
                }
            }
            if (!hasMoved) setHasMoved(true);

            requestAnimationFrame(gameLoop);
        };

        const animationFrameId = requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            cancelAnimationFrame(animationFrameId);
        };
    }, [position, speed, bounds, onPositionChange, spriteWidth, spriteHeight]);


    // Add touch controls from ArrowControls.js if needed, which would also update keysPressed.current

    if (!gameState.characterSprite) return null;

    return (
        <div
            style={{
                position: 'absolute',
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: `${spriteWidth}px`,
                height: `${spriteHeight}px`,
                transform: isFacingLeft ? 'scaleX(-1)' : 'scaleX(1)',
                transition: 'transform 0.1s ease', // For smoother flipping
            }}
            className="z-50" // Ensure player is above background but below some UI elements
        >
            <img
                src={gameState.characterSprite}
                alt="Player Character"
                className="w-full h-full object-contain"
            />
            {/* Optional: Display player name above character */}
            {/* <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                {gameState.playerName}
            </div> */}
        </div>
    );
};

export default Player;