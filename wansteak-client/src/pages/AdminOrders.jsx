import { useEffect, useState } from "react";
import api from '../services/api'
import toast from "react-hot-toast";
import { FaSpinner } from "react-icons/fa";
import OrderTable from "../components/OrderTable";
import Pagination from "../components/Pagination";
import { useOrders } from "../hooks/useOrders";
import OrderDetailModal from "../components/OrderDetailModal";

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

            <OrderDetailModal 
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </div>
    );
};

export default AdminOrders;