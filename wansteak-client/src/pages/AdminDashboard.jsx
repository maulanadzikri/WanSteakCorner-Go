import React, { useEffect, useState } from "react";
import api from '../services/api'
import { FaSpinner } from "react-icons/fa";
import { HiOutlineCheckCircle, HiOutlineCurrencyDollar, HiOutlineShoppingCart, HiOutlineTrendingUp, HiOutlineViewGrid, HiOutlineXCircle } from "react-icons/hi";


const AdminDashboard = () => {
    const [stats, setStats] = useState({
        total_revenue: 0,
        today_revenue: 0,
        total_orders: 0,
        completed_orders: 0,
        total_menus: 0,
    });
    const [loading, setLoading] = useState(true);

    const fetchStats = async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true)

            const response = await api.get('/dashboard/stats');
            if (response.data.data && response.data) {
                setStats(response.data.data);
            }
        } catch (error) {
            console.error("Gagal mengambil data statistik:", error);
        } finally {
            if (!isBackground) setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats(false);

        const interval = setInterval(() => {
            fetchStats(true);
        }, 60000);

        return () => clearInterval(interval);
    }, []);

    const formatRupiah = (number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(number);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <FaSpinner className="animate-spin text-4xl text-red-500 mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Memuat ringkasan bisnis...</p>
            </div>
        );
    }

    return (
        <div className="animate-fade-in-up">
            <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-800">Ringkasan Bisnis</h2>
                <p className="text-gray-500 text-sm mt-1">Pantau performa penjualan Wansteak Corner hari ini</p>
            </div>

            {/* Grid Card Statistic */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* Card 1: Today Revenue */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition">
                    <div className="p-4 bg-green-50 text-green-600 rounded-xl">
                        <HiOutlineTrendingUp className="text-4xl" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Pendapatan Hari Ini</p>
                        <h3 className="text-2xl font-extrabold text-gray-800">{formatRupiah(stats.today_revenue)}</h3>
                    </div>
                </div>

                {/* Card 2: Total Revenue */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-xl">
                        <HiOutlineCurrencyDollar className="text-4xl" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Total Pendapatan</p>
                        <h3 className="text-2xl font-extrabold text-gray-800">{formatRupiah(stats.total_revenue)}</h3>
                    </div>
                </div>

                {/* Card 3: Total Orders */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition">
                    <div className="p-4 bg-orange-50 text-orange-600 rounded-xl">
                        <HiOutlineShoppingCart className="text-4xl" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Semua Pesanan</p>
                        <h3 className="text-2xl font-extrabold text-gray-800">
                            {stats.total_orders} <span className="text-sm font-medium text-gray-500">transaksi</span>
                        </h3>
                    </div>
                </div>

                {/* Card 4: Completed Orders */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition">
                    <div className="p-4 bg-teal-50 text-teal-600 rounded-xl">
                        <HiOutlineCheckCircle className="text-4xl" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Pesanan Sukses</p>
                        <h3 className="text-2xl font-extrabold text-gray-800">
                            {stats.completed_orders} <span className="text-sm font-medium text-gray-500">transaksi</span>
                        </h3>
                    </div>
                </div>

                {/* Card 5: Cancelled Orders */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition">
                    <div className="p-4 bg-red-50 text-red-600 rounded-xl">
                        <HiOutlineXCircle className="text-4xl" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Pesanan Batal</p>
                        <h3 className="text-2xl font-extrabold text-gray-800">
                            {stats.cancelled_orders} <span className="text-sm font-medium text-gray-500">transaksi</span>
                        </h3>
                    </div>
                </div>

                {/* Card 6: Total Menus */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-5 hover:shadow-md transition">
                    <div className="p-4 bg-purple-50 text-purple-600 rounded-xl">
                        <HiOutlineViewGrid className="text-4xl" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500 mb-1">Total Menu Aktif</p>
                        <h3 className="text-2xl font-extrabold text-gray-800">
                            {stats.total_menus} <span className="text-sm font-medium text-gray-500">menu</span>
                        </h3>
                    </div>
                </div>

            </div>
        </div>
    )
};

export default AdminDashboard;