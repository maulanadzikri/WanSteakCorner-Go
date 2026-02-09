import React from 'react';

const MenuCard = ({ menu, addToCart }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Gambar dengan fallback jika error */}
      <img 
        src={menu.image || "https://via.placeholder.com/300x200?text=No+Image"} 
        alt={menu.name} 
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
            <h3 className="font-bold text-lg text-gray-800">{menu.name}</h3>
            <span className={`text-xs px-2 py-1 rounded ${menu.stok === 'tersedia' ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-500'}`}>
                {menu.stok}
            </span>
        </div>
        <p className="text-red-600 font-bold text-xl mb-4">
          Rp {menu.price.toLocaleString('id-ID')}
        </p>
        <button
          disabled={menu.stok !== 'tersedia'}
          onClick={() => addToCart(menu)}
          className={`w-full py-2 rounded font-semibold transition ${
            menu.stok === 'tersedia' 
              ? 'bg-red-600 text-white hover:bg-red-700' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {menu.stok === 'tersedia' ? 'Pesan Sekarang' : 'Habis'}
        </button>
      </div>
    </div>
  );
};

export default MenuCard;