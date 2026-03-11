import { useEffect, useState } from "react";
import api from '../services/api'
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
import OrderTable from "../components/OrderTable";
import Pagination from "../components/Pagination";

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(10)
    const [totalPages, setTotalPages] = useState(1)
    const [totalData, setTotalData] = useState(0)

    const fetchAllOrders = async (isBackground = false) => {
        try {
            if (!isBackground) {
                setLoading(true);
            }

            const response = await api.get(`/orders?page=${page}&limit=${limit}`);
            const sortedOrders = (response.data.data || response.data).sort((a, b) => 
                new Date(b.created_at) - new Date(a.created_at)
            );

            setOrders(sortedOrders);
            if (response.data.meta) {
                setTotalPages(response.data.meta.total_pages);
                setTotalData(response.data.meta.total);
            }
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
    }, [page, limit]);

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setPage(1);
    };

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
                <OrderTable 
                    orders={orders}
                    emptyMessage="Tidak ada pesanan masuk saat ini."
                    onViewDetail={setSelectedOrder}
                    renderAction={(order) => {
                        if (order.status === 'paid') {
                            return (
                                <button
                                    onClick={() => handleUpdateStatus(order.id, 'processing')}
                                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition w-full" 
                                >
                                    Mulai Masak
                                </button>
                            );
                        } else if (order.status === 'processing') {
                            return (
                                <button
                                    onClick={() => handleUpdateStatus(order.id, 'completed')}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition w-full" 
                                >
                                    Siap Disajikan
                                </button>
                            );
                        }
                        return <span className="text-gray-400 text-sm">-</span>;
                    }}
                />
            </div>

            {/* PAGINATION & LIMIT DATA */}
            <Pagination 
                page={page}
                limit={limit}
                totalPages={totalPages}
                totalData={totalData}
                onPageChange={setPage}
                onLimitChange={handleLimitChange}
            />

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