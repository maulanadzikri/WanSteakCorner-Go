import React from 'react';

export const getStatusBadge = (status) => {
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