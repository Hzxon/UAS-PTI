import React, { useEffect, useState } from 'react';

const InventoryBag = ({ newItem }) => {
    const [items, setItems] = useState(() => {
        const saved = localStorage.getItem('inventoryItems');
        return saved ? JSON.parse(saved) : [];
    });
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (newItem) {
            const updatedItems = [...items, newItem];
            setItems(updatedItems);
            localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
        }
    }, [newItem]);

    const toggleInventory = () => {
        setIsOpen(!isOpen);
    };

    return (
        <div className="fixed bottom-[150px] right-5 z-[1000]">
            <button
                onClick={toggleInventory}
                className="w-14 h-14 flex items-center justify-center"
            >
                <img src="/images/gambar/cth-g.jpg" alt="Tas" className="w-[100px] hover:w-[200px] transition-all duration-1000" />
            </button>

            {isOpen && (
                <div className="mt-2 bg-white bg-opacity-90 p-4 rounded-lg shadow-lg w-[250px]">
                    <h3 className="font-bold mb-2 text-lg">Tas</h3>
                    {items.length === 0 ? (
                        <p className="text-sm text-gray-500">Tas kosong</p>
                    ) : (
                        <ul className="text-sm">
                            {items.map((item, index) => (
                                <li key={index}>• {item.name || item}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default InventoryBag;
