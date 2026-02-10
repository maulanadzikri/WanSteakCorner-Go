import React from 'react';
import { FaUtensils, FaShoppingCart, FaHistory } from 'react-icons/fa';
import { Link } from 'react-router-dom'

const Navbar = ({ cartCount, setShowCart }) => {
  return (
    <nav className="bg-red-700 text-white p-4 shadow-md sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo * Judul -> Klik untuk kembali ke Home */}
        <Link to="/" className="flex items-center gap-2 hover:text-gray-200 transition">
          <FaUtensils className="text-2xl" />
          <h1 className="text-xl font-bold">Wan Steak Corner</h1>
        </Link>
        
        <div className="flex items-center gap-4">
          {/* Tombol link ke halaman Riwayat */}
          <Link
            to="/transactions"
            className="flex items-center gap-1 hover:bg-red-800 px-3 py-2 rounded-lg transition"
            title="Riwaya Pesanan"
          >
            <FaHistory className="text-xl"/>
            <span className="hidden md:inline font-semibold">Riwayat</span>
          </Link>

          {/* Tombol Kerangjang (Cart) */}
          <button 
            onClick={() => setShowCart(true)}
            className="relative p-2 hover:bg-red-800 rounded-full transition">
            <FaShoppingCart className="text-2xl" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-yellow-400 text-red-800 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;