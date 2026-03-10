import { useEffect, useState } from "react";
import api from '../services/api'
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const fetchAllOrders = async (isBackground = false) => {
        try {
            if (!isBackground) {
                setLoading(true);
            }

            const response = await api.get('/orders');
            const sortedOrders = (response.data.data || response.data).sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );

            setOrders(sortedOrders);
        } catch (error) {
            console.error("Gagal mengambil data pesanan: ", error);
            if (!isBackground) toast.error("Gagal memuat pesanan")
        } finally {
            if (!isBackground) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchAllOrders(false);

        // Interval refresh data order per 10s
        const interval = setInterval(() => {
            fetchAllOrders(true);
        }, 10000);
        return () => clearInterval(interval);
    }, []);

    const handleUpdateStatus = async (orderId, newOrderStatus) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newOrderStatus });
            toast.success("Status pesanan berhasil diperbarui")
            fetchAllOrders();
        } catch (error) {
            console.error("Gagal update status: ", error);
            toast.error("Gagal memperbarui status pesanan.");
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
                <p className="text-gray-500 font-medium animate-pulse">Memuat data pesanan...</p>
            </div>
        );
    }

    // Ensure data items are in array form
    const parseItems = (items) => {
        if (!items) return [];

        console.log("Isi data Items:", items);

        if (Array.isArray(items)) return items;
        if (typeof items === 'string') {
            try {
                const parsed = JSON.parse(items);
                return Array.isArray(items) ? parsed : [parsed];
            } catch (e) {
                console.error("Gagal parsing string item:", e);
                return [];
            }
        }

        if (typeof items === 'object') {
            return [items];
        }

        return [];
    };

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
                                    <button
                                        onClick={() => setSelectedOrder(order)}
                                        className="text-blue-600 font-semibold hover:text-blue-800 hover:underline flex items-center gap-1 transition"
                                    >
                                        Lihat detail
                                    </button>
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

            {selectedOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm transition-opacity">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
                        {/* Modal Header */}
                        <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                            <h3 className="font-bold text-gray-800 text-lg">
                                Detail Pesanan
                            </h3>
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="text-gray-400 hover:text-red-500 transition text-2xl leading-none"
                            >
                                &times;
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-6">
                            <div className="mb-4 text-sm text-gray-600">
                                <p><strong>Order ID:</strong> {selectedOrder.id}</p>
                                <p><strong>Pelanggan:</strong> {selectedOrder.customer_name}</p>
                            </div>

                            <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 max-h-60 overflow-y-auto">
                                <ul className="space-y-3">
                                    {parseItems(selectedOrder.items).map((item, idx) => (
                                        <li key={idx} className="flex justify-between items-center border-b border-gray-200 border-dashed pb-2 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3">
                                                <span className="bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded text-sm">
                                                    {item.quantity}x        
                                                </span>
                                                <span className="font-medium text-gray-800">
                                                    {item.name || item.menu_name}
                                                </span>
                                            </div>
                                            <span className="text-sm text-gray-600">
                                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                            </span>
                                        </li>
                                    ))}
                                    {parseItems(selectedOrder.items).length === 0 && (
                                        <li className="text-gray-500 italic">Detail item tidak ditemukan.</li>
                                    )}
                                </ul>
                                <div className="mt-4 pt-3 border-t border-gray-200 border-dashed flex justify-between items-center text-lg">
                                    <span className="font-bold text-gray-800">Total Pembayaran</span>
                                    <span className="font-extrabold text-red-600">
                                        Rp {selectedOrder.total?.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end">
                            <button
                                onClick={() => setSelectedOrder(null)}
                                className="bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminOrders;