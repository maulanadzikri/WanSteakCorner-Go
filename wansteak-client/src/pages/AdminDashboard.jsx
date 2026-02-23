import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
    const navigate = useNavigate();

    // cek apakah user punya token saat halaman dimuat
    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token){
            navigate("/login");
        }
    }, [navigate]);

    const handleLogout = () => {
        // Remove token and redirect to login
        localStorage.removeItem("admin_token");
        navigate("/login");
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Dashboard Admin</h1>
                <button
                    onClick={handleLogout}
                    className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900">
                    Logout
                </button>
            </div>

            <div className="bg-white p-6 rounded shadow">
                <p>Selamat datang Admin!</p>
            </div>
        </div>
    );
};

export default AdminDashboard;