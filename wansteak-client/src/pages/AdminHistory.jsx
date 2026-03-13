import { useState } from "react";
import { FaSpinner } from "react-icons/fa";
import OrderTable from "../components/OrderTable";
import Pagination from "../components/Pagination";
import { useOrders } from "../hooks/useOrders";
import OrderDetailModal from "../components/OrderDetailModal";


const AdminHistory = () => {
    const [selectedOrder, setSelectedOrder] = useState(null);

    // Panggil hook useOrder untuk ngehandle pagination, filterStatus agar kode di sini lebih bersih (DRY)
    const {
        orders, loading, page, setPage, limit, handleLimitChange, 
        filterStatus, handleFilterChange, totalPages, totalData
    } = useOrders();

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <FaSpinner className="animate-spin text-4xl text-red-500 mb-4" />
                <p className="text-gray-500 font-medium animate-pulse">Memuat riwayat transaksi...</p>
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
                        <option value="cancelled">Dibatalkan</option>
                        <option value="expired">Kedaluwarsa</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-hidden">
                {/* Table Data */}
                <OrderTable 
                    orders={orders}
                    emptyMessage="Tidak ada transaksi dengan status tersebut."
                    onViewDetail={(order) => setSelectedOrder(order)}
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
            
            {/* Modal Detail Order */}
            <OrderDetailModal 
                order={selectedOrder}
                onClose={() => setSelectedOrder(null)}
            />
        </div>
    )
};

export default AdminHistory;