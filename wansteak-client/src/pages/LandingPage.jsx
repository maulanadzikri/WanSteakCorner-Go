import React from "react";
import { FaArrowRight, FaUtensils } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img 
                    src="https://images.unsplash.com/photo-1544025162-d76694265947?ixlib=rb-4.0.3&auto=format&fit=crop&w=1469&q=80" 
                    alt="Steak Background" 
                    className="w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900"></div>
            </div>

            <div className="z-10 text-center px-6 max-w-3xl">
                <div className="flex justify-center mb-6">
                    <div className="bg-red-600 p-4 rounded-full shadow-2xl animate-bounce">
                        <FaUtensils size={40} />
                    </div>
                </div>

                <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter uppercase italic">
                    Wan<span className="text-red-600">Steak</span> Corner
                </h1>

                <p className="text-xl md:text-2xl text-gray-300 mb-10 font-light">
                    Sensasi Steak dengan bumbu rahasia yang bikin nagih. <br className="hidden md:block" />
                    Pesan sekarang dan rasakan kenikmatannya!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => navigate('/menu')}
                        className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-full text-xl font-bold transition-all transform hover:scale-105 flex items-center justify-center gap-2 shadow-xl"
                    >
                        Pesan Sekarang <FaArrowRight />
                    </button>

                    <button
                        onClick={() => navigate('/transactions')}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-8 py-4 rounded-full text-xl font-bold transition-all"
                    >
                        Riwayat Pesanan
                    </button>
                </div>
            </div>

            <div className="absolute bottom-10 z-10 text-gray-500 text-sm">
                Open Daily: 10.00 WIB - 22.00 WIB | Jl. Juanda No. 88, Depok | Contact: 0812-3456-7890
            </div>
        </div>
    )
};

export default LandingPage;