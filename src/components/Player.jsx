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
    const animationFrameId = useRef(null);
    const [hasMoved, setHasMoved] = useState(false);

    useEffect(() => {
        setPosition({ x: initialX, y: initialY });
    }, [initialX, initialY]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            keysPressed.current[e.key.toLowerCase()] = true;
            if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', 'w', 'a', 's', 'd'].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
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

            if (keysPressed.current['w'] || keysPressed.current['arrowup'] || gameState.arrowKeys.up) {
                newY -= speed;
                moved = true;
            }
            if (keysPressed.current['s'] || keysPressed.current['arrowdown'] || gameState.arrowKeys.down) {
                newY += speed;
                moved = true;
            }
            if (keysPressed.current['a'] || keysPressed.current['arrowleft'] || gameState.arrowKeys.left) {
                newX -= speed;
                setIsFacingLeft(true);
                moved = true;
            }
            if (keysPressed.current['d'] || keysPressed.current['arrowright'] || gameState.arrowKeys.right) {
                newX += speed;
                setIsFacingLeft(false);
                moved = true;
            }

            if (moved) {
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

            animationFrameId.current = requestAnimationFrame(gameLoop);
        };

        animationFrameId.current = requestAnimationFrame(gameLoop);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [speed, bounds, spriteWidth, spriteHeight]);

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
                transition: 'transform 0.1s ease',
            }}
            className="z-50"
        >
            <img
                src={gameState.characterSprite}
                alt="Player Character"
                className="w-full h-full object-contain"
            />
        </div>
    );
};

export default Player;