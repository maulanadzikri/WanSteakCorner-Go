import React from "react";
import EmptyState from "./EmptyState";
import { HiOutlineDocumentText } from "react-icons/hi";

const OrderTable = ({ orders, renderAction, onViewDetail, emptyMessage = "Tidak ada transaksi yang ditemukan."}) => {
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

    return (
        <div className="overflow-x-auto overflow-y-auto h-full w-full">
            <table className="w-full text-left border-collapse relative">
                <thead className="sticky top-0 z-10 bg-gray-50">
                    <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                        <th className="p-4 font-semibold">Order ID & Waktu</th>
                        <th className="p-4 font-semibold">Pelanggan</th>
                        <th className="p-4 font-semibold">Pesanan</th>
                        <th className="p-4 font-semibold">Total</th>
                        <th className="p-4 font-semibold">Status</th>
                        {renderAction && <th className="p-4 font-semibold text-center">Aksi</th>}
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
                            <td className="p-4 text-center">
                                {onViewDetail ? (
                                    <button
                                        onClick={() => onViewDetail(order)}
                                        className="text-blue-600 font-semibold hover:text-blue-800 hover:underline text-sm transition"
                                    >
                                        Lihat Detail
                                    </button>
                                ) : '-'}
                            </td>
                            <td className="p-4 font-semibold text-gray-800">
                                Rp {order.total?.toLocaleString('id-ID')}
                            </td>
                            <td className="p-4">{getStatusBadge(order.status)}</td>
                            
                            {/* BAGIAN RENDER PROPS: Memanggil fungsi yang dikirim dari Parent */}
                            {renderAction && (
                                <td className="p-4 text-center align-middle">
                                    {renderAction(order)}
                                </td>
                            )}
                        </tr>
                    ))}

                    {/* Kondisi jika data kosong */}
                    {(!orders || orders.length === 0) && (
                        <tr>
                            <td colSpan={renderAction ? "6" : "5"} className="p-0">
                                <EmptyState 
                                    icon={HiOutlineDocumentText}
                                    title="Tabel Kosong"
                                    message={emptyMessage}
                                />
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default OrderTable;