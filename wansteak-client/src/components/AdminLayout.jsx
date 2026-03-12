import React, { useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { FaBars, FaSignOutAlt, FaTimes } from "react-icons/fa";
import { MdNotifications, MdRestaurantMenu, MdHistory, MdDashboard } from "react-icons/md";
import toast from "react-hot-toast";
import ConfirmModal from "./ConfirmModal";

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false)

    const triggerLogout = () => {
        setShowLogoutModal(true);
    };

    const confirmLogout = () => {
        setShowLogoutModal(false);
        // Remove token and redirect to login
        localStorage.removeItem("admin_token");
        toast.success("Berhasil logout")
        navigate("/login");
    };

    // Fungsi kecil untuk mengecek apakah menu sedang aktif
    const isActive = (path) => location.pathname.includes(path);

    let pageTitle = "Dashboard Admin";
    if (isActive('admin/dashboard')) pageTitle = "Dashboard";
    if (isActive('admin/menu')) pageTitle = "Manajemen Menu";
    if (isActive('admin/orders')) pageTitle = "Pesanan Masuk";
    if (isActive('admin/history')) pageTitle = "Riwayat Transaksi";

    return (
        <div className="flex h-screen bg-gray-50 overflow-hidden">
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside 
                className={`fixed inset-y-0 left-0 z-50 w-64 h-full bg-white border-r border-gray-200 flex flex-col shadow-lg md:shadow-sm transform transition-transform duration-300 ease-in-out 
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                md:relative md:translate-x-0 flex-shrink-0`}
            >
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                    <h2 className="text-2xl font-extrabold text-red-600">Wan Steak Admin</h2>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-gray-500 hover:text-red-600 md:hidden text-2xl"
                    >
                        <FaTimes />
                    </button>
                </div>

                <nav className="flex flex-col flex-1 p-4 gap-2">
                    <Link
                        to="/admin/dashboard"
                        className={`px-4 py-3 rounded-lg font-semibold transition flex items-center gap-3 ${isActive('/admin/dashboard') ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <MdDashboard className="text-2xl" />Dashboard
                    </Link>    
                    <Link
                        to="/admin/menu"
                        className={`px-4 py-3 rounded-lg font-semibold transition flex items-center gap-3 ${isActive('/admin/menu') ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <MdRestaurantMenu className="text-2xl" />Manajemen Menu
                    </Link>    
                    <Link
                        to="/admin/orders"
                        className={`px-4 py-3 rounded-lg font-semibold transition flex items-center gap-3 ${isActive('/admin/orders') ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <MdNotifications className="text-2xl" /> Pesanan Masuk
                    </Link>    
                    <Link
                        to="/admin/history"
                        className={`px-4 py-3 rounded-lg font-semibold transition flex items-center gap-3 ${isActive('/admin/history') ? 'bg-red-50 text-red-600' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <MdHistory className="text-2xl" />Riwayat Transaksi
                    </Link>    
                </nav>
            </aside>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col h-full overflow-hidden w-full">
                <header className="bg-white border-b border-gray-200 px-4 py-4 md:px-8 flex justify-between items-center shadow-sm z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="text-gray-600 hover:text-red-600 focus:outline-none md:hidden text-2xl"
                        >
                            <FaBars />
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-gray-800 truncate">{pageTitle}</h1>
                    </div>

                    <button 
                        onClick={triggerLogout}
                        className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-2 rounded font-semibold hover:bg-red-200 transition text-sm md:text-base"
                    >
                        <FaSignOutAlt className="hidden sm:block"/> 
                        <span>Logout</span>
                    </button>
                </header>

                {/* MAIN CONTENT (DYNAMIC) */}
                <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
                    <Outlet />
                </main>
            </div>

            <ConfirmModal 
                isOpen={showLogoutModal}
                title="Keluar dari Admin?"
                message="Sesi Anda akan diakhiri dan Anda harus login kembali untuk masuk."
                onConfirm={confirmLogout}
                onCancel={() => setShowLogoutModal(false)}
                confirmText="Ya, Keluar"
            />
        </div>
    )

};

export default AdminLayout;