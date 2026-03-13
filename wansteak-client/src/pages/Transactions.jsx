import React, {useEffect, useState} from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import ConfirmModal from '../components/ConfirmModal';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import { getStatusBadge } from '../utils/formatters';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
import { HiOutlineDocumentText } from 'react-icons/hi';


const Transactions = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [cancelOrder, setCancelOrder] = useState(null);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [totalPages, setTotalPages] = useState(1);
    const [totalData, setTotalData] = useState(0);

    const fetchOrders = async () => {
        // 1. ambil data dari local storage
        const localData = JSON.parse(localStorage.getItem('wansteak_orders') || '[]');

        // 2. Hitung totalData dan totalPages di sisi FE
        const total = localData.length;
        setTotalData(total);
        setTotalPages(Math.ceil(total / limit) || 1);

        if (total === 0) {
            setOrders([]);
            setLoading(false);
            return;
        }

        // 3. LOGIKA CLIENT-SIDE PAGINATION (Potong array sesuai limit & page   )
        const startIndex = (page - 1) * limit;
        const endIndex =    startIndex + limit
        const currentPaginatedData = localData.slice(startIndex, endIndex);

        // 4. Lakukan pemanggilan API HANYA untuk data yang sudah dipotong 
        const updateOrders = await Promise.all(currentPaginatedData.map(async (item) => {
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
    }, [page, limit]);

    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setPage(1);
    };

    const handlePay = (snap_token) => {
        if (window.snap) {
            window.snap.pay(snap_token, {
                onSuccess: () => window.location.reload(),
                onPending: () => window.location.reload(),
            });
        }
    };

    const triggerCancel = (orderId) => {
        setCancelOrder(orderId);
    };

    const confirmCancel = async () => {
        if (!cancelOrder) return;

        try {
            await api.post(`/orders/${cancelOrder}/cancel`);
            toast.success("Pesanan berhasil dibatalkan!");
            fetchOrders();
        } catch (error) {
            console.error("Gagal membatalkan pesanan", error);
            toast.error("Gagal membatalkan pesanan")
        } finally {
            setCancelOrder(null);
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
            <Navbar cartCount={0} setShowCart={() => {}} hideCart={true} />
            <div className="container mx-auto p-4 md:p-6">
                <h2 className="text-2xl font-bold mb-6">Riwayat Pesanan Saya</h2>
                <div className="space-y-4">
                    {orders.map((order) => (
                        <div key={order.order_id} className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 mb-4 transition hover:shadow-md flex flex-col gap-4">
        
                            {/* BAGIAN ATAS: Info Order & Badge Status */}
                            <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                                <div>
                                    <p className="text-xs text-gray-400 font-medium mb-1">Order ID</p>
                                    <h3 className="font-bold text-gray-800 text-sm md:text-base">{order.order_id}</h3>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {new Date(order.date || Date.now()).toLocaleString('id-ID', {
                                            day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </p>
                                    <p className="text-sm font-semibold text-yellow-600 mt-1">
                                        {order.customer_name || 'Pelanggan'} 
                                    </p>
                                </div>
                                {/* Status selalu konsisten di pojok kanan atas */}
                                <div className="text-right">
                                    {getStatusBadge(order.status)}
                                </div>
                            </div>

                            {/* BAGIAN BAWAH: Rincian Menu & Total/Aksi */}
                            <div className="flex flex-col md:flex-row justify-between gap-4 md:gap-6">
                                
                                {/* Kiri/Atas: Rincian Menu */}
                                <div className="w-full md:w-3/5 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <p className="text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Rincian Menu</p>
                                    <ul className="space-y-1">
                                        {(order.items || []).slice(0, 3).map((item, idx) => (
                                            <li key={idx} className="flex justify-between text-sm text-gray-700">
                                                <span className="truncate pr-4">
                                                    {item.quantity}x {item.menu_name}
                                                </span>
                                                <span className="font-medium text-gray-500 whitespace-nowrap">
                                                    Rp {item.sub_total?.toLocaleString('id-ID')}
                                                </span>
                                            </li>
                                        ))}
                                        {(order.items || []).length > 3 && (
                                            <li className="text-xs text-gray-400 italic pt-1 border-t border-gray-200 mt-2">
                                                + {(order.items || []).length - 3} menu lainnya...
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                {/* Kanan/Bawah: Total & Tombol Aksi */}
                                <div className="w-full md:w-2/5 flex flex-col justify-between">
                                    
                                    {/* Total Pembayaran (Mobile: Kiri-Kanan, Desktop: Rata Kanan) */}
                                    <div className="flex justify-between md:flex-col md:items-end mb-4 md:mb-0">
                                        <p className="text-xs text-gray-400 font-medium md:mb-1">Total Pembayaran</p>
                                        <p className="text-lg md:text-xl font-bold text-red-600">
                                            Rp {order.total?.toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                    
                                    {/* Tombol Aksi (Hanya muncul jika Pending!) */}
                                    {order.status === 'pending' && (
                                        <div className="flex gap-2 w-full mt-4 md:mt-auto">
                                            <button 
                                                onClick={() => triggerCancel(order.order_id)}
                                                className="bg-red-50 text-red-500 text-sm py-2 px-4 rounded-lg font-semibold hover:bg-red-100 transition shadow-sm flex-1 text-center">
                                                Batalkan
                                            </button>
                                            <button 
                                                onClick={() => handlePay(order.snap_token)}
                                                className="bg-blue-600 text-white text-sm py-2 px-4 rounded-lg font-semibold hover:bg-blue-700 transition shadow-sm flex-1 text-center">
                                                Bayar
                                            </button>
                                        </div>
                                    )}
                                    {/* Kita HAPUS teks "Dibatalkan/Selesai" di sini karena sudah ada Badge di atas! */}
                                    
                                </div>
                            </div>
                        </div>
                    ))}
                    {orders.length === 0 && (
                        <div className="text-center py-10 text-gray-500">
                            <EmptyState 
                                icon={HiOutlineDocumentText}
                                title="Riwayat Transaksi Kosong"
                                message="Silahkan pilih menu dan buat pesanan."
                            />
                        </div>
                    )}
                </div>

                {/* PAGINATION & LIMIT DATA */}
                <Pagination 
                    page={page}
                    limit={limit}
                    totalPages={totalPages}
                    totalData={totalData}
                    onPageChange={setPage}
                    onLimitChange={handleLimitChange}
                    limitOptions={[5, 10, 20, 50]}
                />
            </div>

            <ConfirmModal 
                isOpen={!!cancelOrder}
                title="Batalkan pesanan ini?"
                message=""
                onConfirm={confirmCancel}
                onCancel={() => setCancelOrder(null)}
                confirmText="Ya, Batalkan"
            />
        </div>
    );
};

export default Transactions;