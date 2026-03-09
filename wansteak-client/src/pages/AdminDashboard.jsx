import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../services/api';
import { FaEdit, FaTrash, FaPlus, FaSignOutAlt } from 'react-icons/fa';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [menus, setMenus] = useState([]);

    // State for Modal Form
    const [showModal, setShowModal] = useState(false);
    const [isEdit, setIsEdit] = useState(false); // Marker whether this is Edit or Add mode
    const [editId, setEditId] = useState(null);

    // State Form
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        image: '',
        stok: 'tersedia'
    });

    // 1. Check Auth & Fetch Data Menu on first render
    useEffect(() => {
        const token = localStorage.getItem("admin_token");
        if (!token){
            navigate("/login");
            return;
        }
        fetchMenus();
    }, [navigate]);

    // --- API FUNCTION (READ, CREATE, UPDATE, DELETE) ---
    const fetchMenus = async () => {
        try {
            const response = await api.get('/menu');
            setMenus(response.data.data || []);
        } catch (error) {
            console.error("Gagal mengambil data menu", error);
            if (error.response?.status === 401) handleLogout(); // if token expired, force logout
        }
    }; 

    const handleDelete = async (id) => {
        if (!window.confirm("Yakin ingin menghapus menu ini?")) return;
        try {
            await api.delete(`/menu/${id}`);
            fetchMenus(); // refresh table
            alert("Menu berhasil dihapus!");
        } catch (error) {
            console.error("Gagal menghapus", error);
            alert("Gagal menghapus menu.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Convert price from string (input type text) to number
        const payload = {
            ...formData,
            price: Number(formData.price)
        };

        try {
            if (isEdit) {
                // Process Edit (PUT)
                await api.put(`/menu/${editId}`, payload);
                alert("Menu berhasil diupdate!");
            } else {
                // Process Add (POST)
                await api.post('/menu', payload);
                alert("Menu berhasil ditambahkan!");
            }

            setShowModal(false); // Close Modal
            fetchMenus(); // Refresh table
        } catch (error) {
            console.error("Gagal simpan data", error);
            alert("Gagal menyimpan menu. Cek console untuk detail.");
        }
    };

    // --- FUNCTION UI / HANDLER ---
    const handleLogout = () => {
        // Remove token and redirect to login
        localStorage.removeItem("admin_token");
        navigate("/login");
    };

    const openAddModal = () => {
        setIsEdit(false);
        setFormData({name: '', price: '', image: '', stok: 'tersedia'});
        setShowModal(true);
    };

    const openEditModal = (menu) => {
        setIsEdit(true);
        setEditId(menu.id);
        setFormData({
            name: menu.name,
            price: menu.price,
            image: menu.image,
            stok: menu.stok
        });
        setShowModal(true);
    };

    const handleFormChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen bg-gray-100 p-6 font-sans">
            
            {/* Tabel Konten */}
            <div className="max-w-6xl mx-auto bg-white rounded-lg shadow overflow-hidden">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="text-lg font-semibold text-gray-700">Daftar Menu</h2>
                    <button 
                        onClick={openAddModal}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition shadow">
                        <FaPlus /> Tambah Menu
                    </button>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-100 text-gray-600 text-sm uppercase tracking-wider">
                                <th className="p-4 font-semibold border-b">Gambar</th>
                                <th className="p-4 font-semibold border-b">Nama Menu</th>
                                <th className="p-4 font-semibold border-b">Harga</th>
                                <th className="p-4 font-semibold border-b">Stok</th>
                                <th className="p-4 font-semibold border-b text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-700">
                            {menus.map((menu) => (
                                <tr key={menu.id} className="border-b hover:bg-gray-50 transition">
                                    <td className="p-4">
                                        <img src={menu.image || "https://placehold.co/50x50?text=No+Img"} alt={menu.name} className="w-16 h-16 object-cover rounded shadow-sm" />
                                    </td>
                                    <td className="p-4 font-medium">{menu.name}</td>
                                    <td className="p-4 text-red-600 font-semibold">
                                        Rp {menu.price.toLocaleString('id-ID')}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 text-xs rounded-full font-bold ${
                                            menu.stok === 'tersedia' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {menu.stok.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-center gap-3">
                                            <button onClick={() => openEditModal(menu)} className="text-blue-500 hover:text-blue-700 p-2 bg-blue-50 rounded-full transition" title="Edit">
                                                <FaEdit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(menu.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-full transition" title="Hapus">
                                                <FaTrash size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {menus.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-500">Belum ada menu. Silakan tambah menu baru.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL FORM (TAMBAH / EDIT) */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                            <h2 className="text-xl font-bold text-gray-800">
                                {isEdit ? 'Edit Menu' : 'Tambah Menu Baru'}
                            </h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-red-500 font-bold text-xl">&times;</button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Menu</label>
                                <input 
                                    type="text" name="name" value={formData.name} onChange={handleFormChange} required
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                    placeholder="Contoh: Steak Wagyu"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Harga (Rp)</label>
                                <input 
                                    type="number" name="price" value={formData.price} onChange={handleFormChange} required min="0"
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                    placeholder="Contoh: 150000"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">URL Gambar (Opsional)</label>
                                <input 
                                    type="text" name="image" value={formData.image} onChange={handleFormChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                                    placeholder="https://..."
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Status Stok</label>
                                <select 
                                    name="stok" value={formData.stok} onChange={handleFormChange}
                                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:outline-none">
                                    <option value="tersedia">Tersedia</option>
                                    <option value="habis">Habis</option>
                                </select>
                            </div>
                            
                            <div className="pt-4 flex gap-3">
                                <button type="button" onClick={() => setShowModal(false)} className="w-1/2 py-2 bg-gray-200 text-gray-800 font-semibold rounded hover:bg-gray-300 transition">
                                    Batal
                                </button>
                                <button type="submit" className="w-1/2 py-2 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition">
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;