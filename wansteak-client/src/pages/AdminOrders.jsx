import { useEffect, useState } from "react";
import api from '../services/api'
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
import OrderTable from "../components/OrderTable";
import Pagination from "../components/Pagination";
import { useOrders } from "../hooks/useOrders";

const AdminOrders = () => {
    const [selectedOrder, setSelectedOrder] = useState(null);

    const {
        orders, loading, page, setPage, limit, handleLimitChange, 
        filterStatus, handleFilterChange, totalPages, totalData, refreshOrders
    } = useOrders({ 
        pollingInterval: 10000,
        excludeStatuses: ['cancelled', 'expired']
    });

    const handleUpdateStatus = async (orderId, newOrderStatus) => {
        try {
            await api.patch(`/orders/${orderId}/status`, { status: newOrderStatus });
            toast.success("Status pesanan berhasil diperbarui")
            refreshOrders();
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
        <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Header dan Fitur filter */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-gray-50 gap-4 flex-shrink-0">
                <h2 className="text-lg font-bold text-gray-800">Semua Transaksi</h2>
                <div className="flex items-center gap-2">
                    <label className="text-sm font-semibold text-gray-600">Filter Status:</label>
                    <select 
                        value={filterStatus}
                        onChange={handleFilterChange}
                        className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
                    >
                        <option value="all">Semua Status</option>
                        <option value="completed">Selesai</option>
                        <option value="paid">Sudah Dibayar</option>
                        <option value="processing">Sedang Dimasak</option>
                        <option value="pending">Menunggu Pembayaran</option>
                    </select>
                </div>
            </div>
            <div className="flex-1 overflow-hidden">
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

            <div className="flex-shrink-0">
                {/* PAGINATION & LIMIT DATA */}
                <Pagination 
                    page={page}
                    limit={limit}
                    totalPages={totalPages}
                    totalData={totalData}
                    onPageChange={setPage}
                    onLimitChange={handleLimitChange}
                />
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