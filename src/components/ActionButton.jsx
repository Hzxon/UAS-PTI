import React from 'react';

const ActionButton = ({ text, onClick, style, className = '', disabled = false }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`absolute bg-white text-black font-bold py-2 px-3 rounded shadow-lg hover:bg-gray-100 active:bg-gray-200 transition transform hover:scale-105 active:scale-100 z-[60] whitespace-nowrap ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            style={style} // For dynamic positioning
        >
            {text}
        </button>
    );
};

export default ActionButton;