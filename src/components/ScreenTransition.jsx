import React, { useState, useEffect, useRef } from 'react';

const ScreenTransition = ({ children, duration = 500 }) => {
    const [isVisible, setIsVisible] = useState(false);
    const transitionInRef = useRef(null);
    const transitionOutRef = useRef(null); // Assuming you might want this for navigation away

    useEffect(() => {
        // Transition In
        const timerIn = setTimeout(() => {
            if (transitionInRef.current) {
                transitionInRef.current.classList.remove('opacity-100');
                transitionInRef.current.classList.add('opacity-0', 'pointer-events-none');
            }
            setIsVisible(true); // Content becomes visible after fade-in overlay clears
        }, 200); // Small delay before starting fade


        // Clean up
        return () => {
            clearTimeout(timerIn);
        };
    }, [duration]);

    // Note: Transitioning out would typically be handled by the component initiating navigation,
    // by making a similar overlay visible before changing the route.

    return (
        <>
            {/* Overlay for initial fade-in */}
            <div
                ref={transitionInRef}
                className="fixed top-0 left-0 w-full h-full bg-black opacity-100 transition-opacity pointer-events-auto z-[1000]" // Starts opaque
                style={{ transitionDuration: `${duration}ms` }}
            ></div>
            {/* Content */}
            <div className={`transition-opacity duration-500 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                {children}
            </div>
        </>
    );
};

export default ScreenTransition;