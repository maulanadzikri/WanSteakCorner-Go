import React, {useEffect, useState} from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';

const Transactions = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchOrders = async () => {
        // 1. ambil data dari local storage
        const localData = JSON.parse(localStorage.getItem('wansteak_orders') || '[]');

        if (localData.length === 0) {
            setLoading(false);
            return;
        }

        const updateOrders = await Promise.all(localData.map(async (item) => {
            try {
                const res = await api.get(`/orders/${item.order_id}`);
                return {...item, ...res.data.data}; // gabung data local + data BE (status terbaru)
            } catch (err) {
                return item; // jika error (misal dihapus db), pakai data local saja
            }
        }));

        setOrders(updateOrders);
        setLoading(false);
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handlePay = (snap_token) => {
        if (window.snap) {
            window.snap.pay(snap_token, {
                onSuccess: () => window.location.reload(),
                onPending: () => window.location.reload(),
            });
        }
    };

    const handleCancel = async (orderId) => {
        const isConfirm = window.confirm("Apakah Anda yakin ingin membatalkan pesanan ini?");
        if (!isConfirm) return;

        try {
            await api.post(`/orders/${orderId}/cancel`);
            toast.success("Pesanan berhasil dibatalkan!");
            fetchOrders();
        } catch (error) {
            console.error("Gagal membatalkan pesanan", error);
            toast.error("Gagal membatalkan pesanan")
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'paid': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Sudah Dibayar</span>;
            case 'processing': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Sedang Dimasak</span>;
            case 'completed': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Selesai</span>;
            case 'pending': return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">Menunggu Pembayaran</span>;
            case 'cancelled': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Dibatalkan</span>;
            case 'expired': return <span className="bg-gray-200 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">Kedaluwarsa</span>;
            default: return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <FaSpinner className="animate-spin text-4xl text-red-500 mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Memuat riwayat pesanan...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar cartCount={0} setShowCart={() => {}} />
            <div className="container mx-auto p-4 md:p-6">
                <h2 className="text-2xl font-bold mb-6">Riwayat Pesanan Saya</h2>
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.order_id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-4 transition hover:shadow-md">
        
                            {/* GUNAKAN GRID LAYOUT (12 Kolom) */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">

                                {/* KOLOM KIRI: Info Order (3 Kolom) */}
                                <div className="md:col-span-3 space-y-1">
                                    <p className="text-xs text-gray-400 font-medium">Order ID</p>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-bold text-gray-800 text-sm">{order.order_id}</h3>
                                        <span className="p-4 uppercase">{getStatusBadge(order.status)}</span>
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {new Date(order.date || Date.now()).toLocaleString('id-ID', {
                                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                    <p className="text-sm font-semibold text-yellow-600 pt-1">
                                        {order.customer_name || 'Pelanggan'} 
                                    </p>
                                </div>

                                {/* KOLOM TENGAH: Rincian Menu (6 Kolom) */}
                                {/* Area ini akan selalu mengambil 50% lebar kartu, membuat posisi konsisten */}
                                <div className="md:col-span-6 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Rincian Menu</p>
                                    <ul className="space-y-1">
                                        {/* Tampilkan maksimal 2 item, sisanya "+ X others" agar rapi */}
                                        {(order.items || []).slice(0, 3).map((item, idx) => (
                                            <li key={idx} className="flex justify-between text-sm text-gray-700">
                                                <span className="truncate w-2/3">
                                                    {item.quantity}x {item.menu_name}
                                                </span>
                                                <span className="font-medium text-gray-500">
                                                    Rp {item.sub_total?.toLocaleString('id-ID')}
                                                </span>
                                            </li>
                                        ))}
                                        {(order.items || []).length > 3 && (
                                            <li className="text-xs text-gray-400 italic pt-1">
                                                + {(order.items || []).length - 3} menu lainnya...
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                {/* KOLOM KANAN: Total & Action (3 Kolom) */}
                                <div className="md:col-span-3 flex flex-col items-end justify-center text-right h-full">
                                    <p className="text-xs text-gray-400 mb-1">Total Pembayaran</p>
                                    <p className="text-xl font-bold text-red-600 mb-3">
                                        Rp {order.total?.toLocaleString('id-ID')}
                                    </p>
                                    
                                    {/* Tombol hanya muncul jika Pending, tapi tidak menggeser layout kolom */}
                                    <div className="h-10 w-full flex justify-end">
                                        {order.status === 'pending' ? (
                                            <div>
                                                <button 
                                                    onClick={() => handleCancel(order.order_id)}
                                                    className="bg-red-100 text-red-500 text-sm px-6 py-2 rounded-lg font-semibold hover:bg-red-200 transition shadow-sm hover:shadow-md w-full md:w-auto">
                                                    Batalkan
                                                </button>
                                                <button 
                                                    onClick={() => handlePay(order.snap_token)}
                                                    className="bg-blue-600 text-white text-sm px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow-md w-full md:w-auto">
                                                    Bayar Sekarang
                                                </button>
                                            </div>
                                        ) : order.status === 'cancelled' ? (
                                            <span className="text-red-500 text-sm font-semibold flex items-center">
                                                Pesanan Dibatalkan
                                            </span>
                                        ) : order.status === 'expired' ? (
                                            <span className="text-gray-500 text-sm font-semibold flex items-center">
                                                Waktu Bayar Habis
                                            </span>
                                        ) : (
                                            // Placeholder kosong agar tinggi tetap terjaga (opsional)
                                            <div className="h-10"></div> 
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <p>Belum ada riwayat transaksi.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Transactions;