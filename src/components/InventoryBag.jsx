import React, { useState, useContext, useEffect } from "react";
import { GameContext } from "../contexts/GameContext";

const InventoryBag = ({ newItem }) => {
    const { dispatch } = useContext(GameContext);
    const [items, setItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [bagOpen, setBagOpen] = useState(false);

    const MAX_ITEMS = 15;
    const [tasPenuh, setTasPenuh] = useState(false);

    useEffect(() => {
        if (newItem) {
            setItems((prev) => {
                if (prev.length < MAX_ITEMS) {
                    return [...prev, newItem];
                } else {
                    setTasPenuh(true);
                    setTimeout(() => setTasPenuh(false), 3000);
                    return prev;
                }
            });
        }
    }, [newItem]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            const key = e.key.toLowerCase();
            if (key === 'e' || key === 'i') {
                setBagOpen((prev) => !prev);
                setSelectedItem(null);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

  // Gunakan item
    const handleUseItem = (item) => {
        if (!item.useAction) return;

        item.useAction.effects.forEach((effect) => {
            if (effect.delta !== undefined) {
            dispatch({
                type: "UPDATE_STATUS_DELTA",
                stat: effect.stat,
                delta: effect.delta,
            });
            } else if (effect.valueSet !== undefined) {
            dispatch({
                type: "UPDATE_STAT",
                stat: effect.stat,
                value: effect.valueSet,
            });
            }
        });

        setItems((prev) => prev.filter((i) => i !== item));
        setSelectedItem(null);
        if (items.length === 1) {
            setBagOpen(false);
        }
    };

    const handleDiscardItem = (item) => {
        setItems((prev) => prev.filter((i) => i !== item));
        setSelectedItem(null);
    };

    return (
        <div className="fixed top-[90px] right-5 z-[1000]">
        {/* Ikon tas */}
            <div className="w-[50px] hover:w-[65px] transition-all duration-1000">
                <img
                    src="/images/objek/Tas.png"
                    alt="Tas"
                    className="cursor-pointer"
                    onClick={() => {
                        setBagOpen(true);
                        setSelectedItem(null);
                    }}
                    title="Buka Tas (I)"
                />
            </div>

      {/* Popup isi tas */}
            {bagOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1050]">
                    <div className="bg-[#a07435] bg-cover bg-center p-5 shadow-lg w-[515px] h-[360px]  relative text-white">
                        <button
                            className="absolute top-3 right-6 text-white hover:text-red-500 text-[30px] font-bold"
                            onClick={() => setBagOpen(false)}
                        >
                        ×
                        </button>

                        <h2 className="text-[20px] font-bold mb-4 text-center">Inventory</h2>

                        <div className="flex flex-wrap gap-4 justify-start ml-[6px]">
                            {items.map((item, index) => (
                                <div className="w-20 h-20 bg-[#704f23] bg-opacity-40 border-[4px] border-[#422c0f] flex items-center justify-center">
                                    <img
                                        key={index}
                                        src={item.image}
                                        alt={item.name}
                                        className="w-14 cursor-pointer hover:scale-110 transition"
                                        onClick={() => setSelectedItem(item)}
                                        title={item.name}
                                    />
                                </div>
                            ))}
                            {Array.from({ length: MAX_ITEMS - items.length }).map((_, i) => (
                                <div
                                    key={`empty-${i}`}
                                    className="w-20 h-20 bg-[#704f23] bg-opacity-40 border-[4px] border-[#422c0f] flex items-center justify-center"
                                >
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

      {/* Popup aksi item */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[1100]">
                    <div className="bg-[#a07435] rounded p-5 flex flex-col items-center shadow-lg w-[280px]">
                        <img src={selectedItem.image} alt={selectedItem.name} className="w-24 h-24 mb-3" />
                        <h1 className="text-white mb-3 font-bold text-center">{selectedItem.name}</h1>
                        <p className="text-white mb-3 text-xs text-center">{selectedItem.desc}</p>
                        <button
                            className="bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded mb-2 w-[80%]"
                            onClick={() => handleUseItem(selectedItem)}
                        >
                            {selectedItem.useAction.label}
                        </button>
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mb-2 w-[80%]"
                            onClick={() => handleDiscardItem(selectedItem)}
                        >
                            Buang
                        </button>
                        <button
                            className="text-white underline text-sm"
                            onClick={() => setSelectedItem(null)}
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}

            {tasPenuh && (
                <div className="fixed top-18 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-[2000]">
                    Tas penuh! Gunakan atau buang item terlebih dahulu.
                </div>
            )}
        </div>
    );
};

export default InventoryBag;
