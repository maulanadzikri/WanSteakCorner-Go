import { useEffect, useState } from "react";
import api from '../services/api'

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchAllOrders = async () => {
        try {
            setLoading(true);

            const response = await api.get('/orders');
            const sortedOrders = (response.data.data || response.data).sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );

            setOrders(sortedOrders);
        } catch (error) {
            console.error("Gagal mengambil data pesanan: ", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllOrders();

        // Interval refresh data order per 10s
        const interval = setInterval(fetchAllOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleUpdateStatus = async (orderId, newOrderStatus) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newOrderStatus });
            fetchAllOrders();
        } catch (error) {
            console.error("Gagal update status: ", error);
            alert("Gagal memperbarui status pesanan.");
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'padi': return <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">Pesanan Baru (PAID)</span>;
            case 'processing': return <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-bold">Sedang dimasak</span>;
            case 'completed': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">Selesai</span>;
            case 'pending': return <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">Menunggu dibayar</span>;
            case 'cancelled': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">Dibatalkan</span>;
            case 'expired': return <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-xs font-bold">Kedaluwarsa</span>;
            default: return <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">{status}</span>;
        }
    };

    if (loading && orders.length === 0) return <div className="text-center py-10">Memuat pesanan...</div>;

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-hidden">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                            <th className="p-4 font-semibold">Order ID & Waktu</th>
                            <th className="p-4 font-semibold">Pelanggan</th>
                            <th className="p-4 font-semibold">Pesanan</th>
                            <th className="p-4 font-semibold">Total</th>
                            <th className="p-4 font-semibold">Status</th>
                            <th className="p-4 font-semibold">Aksi Dapur</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orders.map((order) => (
                            <tr key={order.id} className="hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <div className="font-semibold text-gray-800">{order.id}</div>
                                    <div className="text-xs text-gray-500">
                                        {new Date(order.created_at).toLocaleString('id-ID')}
                                    </div>
                                </td>
                                <td className="p-4 text-gray-800">{order.customer_name || '-'}</td>
                                <td className="p-4 text-sm text-gray-600">
                                    <ul className="list-disc list-inside">
                                        {Array.isArray(order.items) ? order.items.map((item, idx) => (
                                            <li key={idx}>{item.quantity}x {item.name || item.menu_name}</li>
                                        )) : "Detail pesanan"}
                                    </ul>
                                </td>
                                <td className="p-4 font-semibold text-gray-800">
                                    Rp {order.total?.toLocaleString('id-ID')}
                                </td>
                                <td className="p-4">
                                    {getStatusBadge(order.status)}
                                </td>
                                <td className="p-4 text-center">
                                    {order.status == 'paid' && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, 'processing')}
                                            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition w-full" 
                                        >
                                            Mulai Masak
                                        </button>
                                    )}
                                    {order.status == 'processing' && (
                                        <button
                                            onClick={() => handleUpdateStatus(order.id, 'completed')}
                                            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition w-full" 
                                        >
                                            Siap Disajikan
                                        </button>
                                    )}
                                    {['pending', 'cancelled', 'expired', 'completed'].includes(order.status) && (
                                        <span className="text-gray-400 text-sm">-</span>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {orders.length === 0 && (
                            <tr>
                                <td colSpan="6" className="p-8 text-center text-gray-500"> 
                                    Belum ada pesanan masuk.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
};

export default AdminOrders;