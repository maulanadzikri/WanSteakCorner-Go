import { useCallback, useEffect, useState } from "react";
import api from '../services/api';
import toast from 'react-hot-toast';


export const useOrders = ({
    initialLimit = 10,
    initialStatus = 'all',
    pollingInterval = null,
} = {}) => {
    // 1. Pindahkan semua state ke sini
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(initialLimit);
    const [filterStatus, setFilterStatus] = useState(initialStatus);
    const [totalPages, setTotalPages] = useState(1);
    const [totalData, setTotalData] = useState(0);

    // 2. Bungkus fungsi fetch menggunakan useCallback agar aman dimasukkan ke useEffect
    const fetchOrders = useCallback(async (isBackground = false) => {
        try {
            if (!isBackground) setLoading(true);

            const response = await api.get(`/orders?page=${page}&limit=${limit}&status=${filterStatus}`);
            const sortedOrders = (response.data.data || response.data).sort((a, b) =>
                new Date(b.created_at) - new Date(a.created_at)
            );

            setOrders(sortedOrders);

            if (response.data.data) {
                setTotalPages(response.data.meta.total_pages);
                setTotalData(response.data.meta.total);
            }
        } catch (error) {
            console.error("Gagal mengambil data pesanan: ", error);
            if (!isBackground) toast.error("Gagal memuat pesanan");
        } finally {
            if (!isBackground) setLoading(false);
        }
    }, [page, limit, filterStatus]); // Fetch akan dipicu ulang jika 3 nilai ini berubah

    // 3. Pindahkan useEffect ke sini
    useEffect(() => {
        fetchOrders(false);

        // Fitur polling, auto-refresh untuk layar dapur (Pesanan Masuk)
        let intervalId;
        if (pollingInterval) {
            intervalId = setInterval(() => {
                fetchOrders(true); // Panggilan background tanpa loading
            }, pollingInterval);
        }

        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [fetchOrders, pollingInterval]);

    // 4. Handler untuk Pagination & Filter
    const handleLimitChange = (newLimit) => {
        setLimit(newLimit);
        setPage(1);
    };

    const handleFilterChange = (e) => {
        setFilterStatus(e.target.value);
        setPage(1);
    };

    // 5. Kembalikan (return) semua data dan fungsi agar bisa dipakai oleh komponen
    return {
        orders,
        loading,
        page,
        setPage,
        limit,
        handleLimitChange,
        filterStatus,
        handleFilterChange,
        totalPages,
        totalData,
        refreshOrders: () => fetchOrders(false) // Fungsi manual jika butuh memicu refresh
    };
};
