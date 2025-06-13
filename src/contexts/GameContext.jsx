import React, { createContext, useState, useEffect, useReducer } from 'react';

export const GameContext = createContext();

// Define initial state based on your localStorage setup in index.html
const initialGameState = {
    playerName: '',
    characterSprite: 'objek/Karakter 1.gif', // Default or from localStorage
    hunger: 100,
    energy: 100,
    happiness: 100,
    hygiene: 100,
    money: 30000,
    gameDay: 1,
    gameHour: 8,
    gameMinute: 0,
    currentLocation: 'Rumah', // Or derive from route
    arrowKeys: { up: false, down: false, left: false, right: false },
    inventory: [],
    // Add other global states as needed
};

// Reducer for complex state updates
function gameReducer(state, action) {
    switch (action.type) {
        case 'SET_PLAYER_DEFAULTS':
            return {
                ...state,
                playerName: action.payload.name,
                characterSprite: action.payload.sprite,
                hunger: 100, // Reset stats on new game
                energy: 100, //
                happiness: 100, //
                hygiene: 100, //
                money: 30000, //
                gameDay: 1, //
                gameHour: 8, //
                gameMinute: 0, //
            };
        case 'LOAD_GAME_STATE':
            return { ...state, ...action.payload };
        case 'UPDATE_STAT': // e.g., { type: 'UPDATE_STAT', stat: 'hunger', value: 90 }
            return { ...state, [action.stat]: Math.max(0, Math.min(100, action.value)) };
        case 'UPDATE_STATUS_DELTA': // e.g., { type: 'UPDATE_STATUS_DELTA', stat: 'energy', delta: -1 }
            return { ...state, [action.stat]: Math.max(0, Math.min(100, state[action.stat] + action.delta)) };
        case 'UPDATE_MONEY':
            return { ...state, money: Math.max(0, state.money + action.amount) };
        case 'ADVANCE_TIME': {
            let { gameMinute, gameHour, gameDay } = state;
            const addMinutes = action.minutes || 0;
            const addHours = action.hours || 0;

            gameMinute += addMinutes;
            gameHour += addHours;

            while (gameMinute >= 60) {
                gameMinute -= 60;
                gameHour += 1;
            }
            while (gameHour >= 24) {
                gameHour -= 24;
                gameDay += 1;
            }
            return { ...state, gameMinute, gameHour, gameDay };
        }
        case 'SET_LOCATION':
            return { ...state, currentLocation: action.payload };
        // Add more actions for specific game logic (sleep, eat, travel costs etc.)
        case 'ARROW_KEY_DOWN':
            return { ...state, arrowKeys: { ...state.arrowKeys, [action.payload]: true } };
        case 'ARROW_KEY_UP':
            return { ...state, arrowKeys: { ...state.arrowKeys, [action.payload]: false } };
        case 'ADD_ITEM':
    if (state.inventory.length >= 15) return state; // maksimal 15 item
    return { ...state, inventory: [...state.inventory, action.payload] };

case 'REMOVE_ITEM':
    return { ...state, inventory: state.inventory.filter(item => item !== action.payload) };

        default:
            return state;
    }
}

export const GameProvider = ({ children }) => {
    const [gameState, dispatch] = useReducer(gameReducer, initialGameState);

    // Load state from localStorage on initial mount
    useEffect(() => {
        const savedName = localStorage.getItem('namaPlayer');
        const savedCharacter = localStorage.getItem('karakterPlayer');
        const savedEnergy = parseInt(localStorage.getItem('energy'), 10);
        // ... load all other relevant items ...
        const savedMoney = parseInt(localStorage.getItem('uang'), 10);
        const savedDay = parseInt(localStorage.getItem('gameDay'), 10);
        const savedHour = parseInt(localStorage.getItem('gameHour'), 10);
        const savedMinute = parseInt(localStorage.getItem('gameMinute'), 10);
        const savedInventory = JSON.parse(localStorage.getItem('inventoryItems') || '[]');

        if (savedName && savedCharacter) {
            dispatch({
                type: 'LOAD_GAME_STATE',
                payload: {
                    playerName: savedName,
                    characterSprite: savedCharacter,
                    energy: isNaN(savedEnergy) ? initialGameState.energy : savedEnergy,
                    hunger: isNaN(parseInt(localStorage.getItem('hunger'),10)) ? initialGameState.hunger : parseInt(localStorage.getItem('hunger'),10),
                    happiness: isNaN(parseInt(localStorage.getItem('happiness'),10)) ? initialGameState.happiness : parseInt(localStorage.getItem('happiness'),10),
                    hygiene: isNaN(parseInt(localStorage.getItem('hygiene'),10)) ? initialGameState.hygiene : parseInt(localStorage.getItem('hygiene'),10),
                    money: isNaN(savedMoney) ? initialGameState.money : savedMoney,
                    gameDay: isNaN(savedDay) ? initialGameState.gameDay : savedDay,
                    gameHour: isNaN(savedHour) ? initialGameState.gameHour : savedHour,
                    gameMinute: isNaN(savedMinute) ? initialGameState.gameMinute : savedMinute,
                    inventory: savedInventory,
                },
            });
        }
    }, []);

    // Save state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('namaPlayer', gameState.playerName);
        localStorage.setItem('karakterPlayer', gameState.characterSprite);
        localStorage.setItem('energy', gameState.energy.toString());
        localStorage.setItem('hunger', gameState.hunger.toString());
        localStorage.setItem('happiness', gameState.happiness.toString());
        localStorage.setItem('hygiene', gameState.hygiene.toString());
        localStorage.setItem('uang', gameState.money.toString());
        localStorage.setItem('gameDay', gameState.gameDay.toString());
        localStorage.setItem('gameHour', gameState.gameHour.toString());
        localStorage.setItem('gameMinute', gameState.gameMinute.toString());
        localStorage.setItem('inventoryItems', JSON.stringify(gameState.inventory));
    }, [gameState]);

    // Game loop for time progression and status decay
    useEffect(() => {
        const timeInterval = setInterval(() => {
            dispatch({ type: 'ADVANCE_TIME', minutes: 1 }); // Advances time
             // Automatic status decay
            dispatch({ type: 'UPDATE_STATUS_DELTA', stat: 'energy', delta: -1 });
            dispatch({ type: 'UPDATE_STATUS_DELTA', stat: 'hygiene', delta: -1 });
            dispatch({ type: 'UPDATE_STATUS_DELTA', stat: 'hunger', delta: -1 });
            dispatch({ type: 'UPDATE_STATUS_DELTA', stat: 'happiness', delta: -1 });
        }, 1000); // Original game updates time every 1000ms, stats every 2000ms. Adjust as needed.

        return () => clearInterval(timeInterval);
    }, []);


    return (
        <GameContext.Provider value={{ gameState, dispatch }}>
            {children}
        </GameContext.Provider>
    );
};