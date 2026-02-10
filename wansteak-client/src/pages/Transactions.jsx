import React, {useEffect, useState} from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';

const Transactions = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        // 1. ambil data dari local storage
        const localData = JSON.parse(localStorage.getItem('wansteak_orders') || '[]');

        // 2. cek status terbaru ke backend untuk setiap order
        const fetchStatuses = async () => {
            const updateOrders = await Promise.all(localData.map(async (item) => {
                try {
                    const res = await api.get(`/orders/${item.order_id}`);
                    return {...item, ...res.data.data}; // gabung data local + data BE (status terbaru)
                } catch (err) {
                    return item; // jika error (misal dihapus db), pakai data local saja
                }
            }));
            setOrders(updateOrders);
        };

        if (localData.length > 0) fetchStatuses();
    }, []);

    const handlePay = (snap_token) => {
        if (window.snap) {
            window.snap.pay(snap_token, {
                onSuccess: () => window.location.reload(),
                onPending: () => window.location.reload(),
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar cartCount={0} setShowCart={() => {}} />
            <div className="container mx-auto p-6">
                <h2 className="text-2xl font-bold mb-6">Riwayat Pesanan Saya</h2>
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.order_id} className="bg-white p-4 rounded shadow flex justify-between items-center">
                            <div>
                                <p className="font-bold">Order ID: {order.order_id} </p>
                                <p className="text-gray-600">Total: Rp {order.total?.toLocaleString()} </p>
                                <p className={`text-sm font-bold ${order.status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                                    Status: {(order.status || 'pending').toUpperCase()}
                                </p>
                            </div>

                            {/* Tombol bayar hanya muncul jika status 'pending' */}
                            {order.status === 'pending' && (
                                <button
                                    onClick={() => handlePay(order.snap_token)}
                                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                                    Bayar Sekarang
                                </button>
                            )}
                        </div>
                    ))}
                    {orders.length === 0 && <p>Belum ada riwayat transaksi.</p>}
                </div>
            </div>
        </div>
    );
};

export default Transactions;