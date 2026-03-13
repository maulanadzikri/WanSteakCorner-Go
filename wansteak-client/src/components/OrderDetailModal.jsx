import React from 'react';
import { FaPrint } from 'react-icons/fa';

const OrderDetailModal = ({ order, onClose }) => {
    if (!order) return null;

    const parseItems = (items) => {
        if (!items) return [];
        if (Array.isArray(items)) return items;
        if (typeof items === 'string') {
            try {
                const parsed = JSON.parse(items);
                return Array.isArray(parsed) ? parsed : [parsed];
            } catch (e) {
                return [];
            }
        }
        if (typeof items === 'object') return [items];
        return [];
    };

    const handlePrint = () => {
        window.print(); // Memanggil dialog print bawaan browser
    };

    return (
        // Latar belakang hitam transparan di layar, tapi jadi putih bersih saat diprint
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4 backdrop-blur-sm transition-opacity print:bg-white print:backdrop-blur-none print:p-0 print:items-start print:justify-start">
            
            {/* Modal Container: Lebar maksimal 400px di layar, tapi seukuran struk thermal (80mm) saat diprint */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all print:shadow-none print:rounded-none print:w-[80mm] print:mx-auto print:text-black">
                
                {/* 🔴 HEADER LAYAR (Sembunyikan saat diprint) */}
                <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex justify-between items-center print:hidden">
                    <h3 className="font-bold text-gray-800 text-lg">Detail Pesanan</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition text-2xl leading-none">&times;</button>
                </div>

                {/* 🖨️ HEADER STRUK KASIR (HANYA MUNCUL SAAT DIPRINT) */}
                <div className="hidden print:block text-center font-mono border-b border-black border-dashed pb-3 pt-4 mb-3">
                    <h2 className="text-xl font-bold uppercase">Wan Steak Corner</h2>
                    <p className="text-xs mt-1">Jl. Contoh Alamat Resto No. 123</p>
                    <p className="text-xs">Telp: 0812-3456-7890</p>
                </div>

                {/* BODY KONTEN */}
                <div className="p-6 print:p-0 print:font-mono">
                    
                    {/* Info Pelanggan & Order ID */}
                    <div className="mb-4 text-sm text-gray-600 print:text-black print:text-xs print:flex print:justify-between print:border-b print:border-black print:border-dashed print:pb-2 print:mb-2">
                        <div>
                            <p><strong>Order ID:</strong> {order.id || order.order_id}</p>
                            <p><strong>Pelanggan:</strong> {order.customer_name || '-'}</p>
                        </div>
                        {/* Waktu print (hanya di struk) */}
                        <div className="hidden print:block text-right">
                            <p>{new Date().toLocaleDateString('id-ID')}</p>
                            <p>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute:'2-digit' })}</p>
                        </div>
                    </div>

                    {/* Daftar Menu */}
                    {/* Di layar bisa di-scroll, di struk akan memanjang ke bawah tanpa scroll */}
                    <div className="bg-gray-50 rounded-lg border border-gray-100 p-4 max-h-60 overflow-y-auto print:bg-transparent print:border-none print:p-0 print:max-h-none print:overflow-visible">
                        <ul className="space-y-3 print:space-y-1">
                            {parseItems(order.items).map((item, idx) => (
                                <li key={idx} className="flex justify-between items-start border-b border-gray-200 border-dashed pb-2 last:border-0 last:pb-0 print:border-none print:pb-0">
                                    
                                    {/* 🔴 Tampilan Layar */}
                                    <div className="flex items-center gap-3 print:hidden">
                                        <span className="bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded text-sm">{item.quantity}x</span>
                                        <span className="font-medium text-gray-800">{item.name || item.menu_name}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-gray-600 print:hidden">
                                        Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                    </span>

                                    {/* 🖨️ Tampilan Struk Kasir */}
                                    <div className="hidden print:block w-full text-xs">
                                        <div className="font-semibold">{item.name || item.menu_name}</div>
                                        <div className="flex justify-between pl-2">
                                            <span>{item.quantity} x {item.price?.toLocaleString('id-ID')}</span>
                                            <span>{(item.price * item.quantity).toLocaleString('id-ID')}</span>
                                        </div>
                                    </div>

                                </li>
                            ))}
                        </ul>
                        
                        {/* Total Pembayaran */}
                        <div className="mt-4 pt-3 border-t border-gray-200 border-dashed flex justify-between items-center text-lg print:border-black print:pt-2 print:mt-2 print:text-sm">
                            <span className="font-bold text-gray-800 print:text-black">Total Pembayaran</span>
                            <span className="font-extrabold text-red-600 print:text-black">Rp {order.total?.toLocaleString('id-ID')}</span>
                        </div>
                    </div>

                    {/* 🖨️ FOOTER STRUK KASIR (HANYA MUNCUL SAAT DIPRINT) */}
                    <div className="hidden print:block text-center font-mono border-t border-black border-dashed pt-3 mt-3 text-xs">
                        <p>Terima Kasih atas pesanan Anda!</p>
                        <p>Simpan struk ini sebagai bukti pembayaran</p>
                    </div>

                </div>

                {/* 🔴 FOOTER LAYAR & TOMBOL (Sembunyikan saat diprint) */}
                <div className="bg-gray-50 border-t border-gray-100 px-6 py-4 flex justify-end gap-3 print:hidden">
                    <button onClick={handlePrint} className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2">
                        <FaPrint /> Cetak Struk
                    </button>
                    <button onClick={onClose} className="bg-gray-800 text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-700 transition">
                        Tutup
                    </button>
                </div>

            </div>
        </div>
    );
};

export default OrderDetailModal;