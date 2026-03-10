import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import MenuCard from '../components/MenuCard';
import { FaTrash, FaTimes, FaSpinner } from 'react-icons/fa';
import toast from 'react-hot-toast';
import { MdAccessTime, MdWarningAmber } from 'react-icons/md';

const Home = () => {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Fetch Menu dari Backend saat loading awal
  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      setLoading(true);
      const response = await api.get('/menu');
      setMenus(response.data.data);
    } catch (error) {
      console.error("Gagal mengambil menu:", error);
    } finally {
      setLoading(false)
    }
  };

  // 2. Logic Cart (Tambah & Hapus)
  const addToCart = (menu) => {
    const existing = cart.find((item) => item.id === menu.id);
    if (existing) {
      setCart(cart.map((item) =>
          item.id === menu.id ? { ...item, qty: item.qty + 1 } : item
      ));
    } else {
      setCart([...cart, { ...menu, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const calculateTotal = () => {
    return cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  };

  // 3. Logic Checkout (Connect ke Midtrans)
  const handleCheckout = async () => {
    if (!customerName || cart.length === 0) {
      toast.error("Nama pelanggan dan keranjang tidak boleh kosong!");
      return;
    }

    setIsLoading(true);
    try {
      // Format payload sesuai request body Backend Go
      const payload = {
        customer_name: customerName,
        items: cart.map(item => ({
          menu_id: item.id,
          quantity: item.qty
        }))
      };

      // Tembak API Backend
      const response = await api.post('/orders', payload);
      const { snap_token, id } = response.data.data; // Pastikan path ini sesuai response backendmu

      const currentHistory = JSON.parse(localStorage.getItem('wansteak_orders') || '[]');
      const newOrderHistory = [
        {
          order_id: id,
          snap_token: snap_token,
          total: calculateTotal(),
          date: new Date().toISOString()
        },
        ...currentHistory
      ];
      localStorage.setItem('wansteak_orders', JSON.stringify(newOrderHistory));

      // Tampilkan Popup Midtrans
      if (window.snap) {
        window.snap.pay(snap_token, {
          onSuccess: function(result) {
            toast.success("Pembayaran Berhasil!");
            setCart([]);
            setCustomerName("");
            setShowCart(false);
            console.log(result);
          },
          onPending: function(result) {
            toast("Menunggu Pembayaran...", {
              icon: <MdAccessTime className="text-yellow-500 text-xl" />
            });
            console.log(result);
          },
          onError: function(result) {
            toast.error("Pembayaran Gagal!");
            console.log(result);
          },
          onClose: function() {
            toast("Anda menutup popup tanpa menyelesaikan pembayaran", {
              icon: <MdWarningAmber className="text-orange-500 text-xl" />
            });
          }
        });
      }
    } catch (error) {
      console.error("Checkout Error:", error);
      toast("Gagal memproses pesanan.");
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center py-20">
              <FaSpinner className="animate-spin text-4xl text-red-500 mb-4" />
              <p className="text-gray-500 font-medium animate-pulse">Memuat menu...</p>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar cartCount={cart.reduce((a, b) => a + b.qty, 0)} setShowCart={setShowCart} />

      {/* Main Content */}
      <div className="container mx-auto p-4 md:p-6">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 border-b pb-2">Daftar Menu</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {menus.map((menu) => (
            <MenuCard key={menu.id} menu={menu} addToCart={addToCart} />
          ))}
        </div>
      </div>

      {/* Cart Sidebar / Modal */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-end">
          <div className="bg-white w-full max-w-md h-full p-6 shadow-xl overflow-y-auto relative">
            <button 
                onClick={() => setShowCart(false)}
                className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
                <FaTimes size={24} />
            </button>
            
            <h2 className="text-2xl font-bold mb-6">Keranjang Pesanan</h2>

            {cart.length === 0 ? (
                <p className="text-gray-500 text-center mt-10">Keranjang masih kosong.</p>
            ) : (
                <>
                    <div className="space-y-4 mb-6">
                        {cart.map((item) => (
                            <div key={item.id} className="flex justify-between items-center border-b pb-2">
                                <div>
                                    <h4 className="font-bold">{item.name}</h4>
                                    <p className="text-sm text-gray-600">
                                        Rp {item.price.toLocaleString()} x {item.qty}
                                    </p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="font-bold text-red-600">
                                        Rp {(item.price * item.qty).toLocaleString()}
                                    </span>
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:text-red-700">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t pt-4">
                        <div className="flex justify-between text-xl font-bold mb-4">
                            <span>Total:</span>
                            <span>Rp {calculateTotal().toLocaleString()}</span>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-2">Nama Pelanggan</label>
                            <input 
                                type="text"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
                                placeholder="Masukkan nama Anda"
                                className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                            />
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={isLoading}
                            className={`w-full py-3 rounded-lg text-white font-bold text-lg flex items-center justify-center transition-all ${
                                isLoading 
                                ? 'bg-gray-400 cursor-not-allowed' 
                                : 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                            }`}
                        >
                            {isLoading ? (
                              <>
                                <FaSpinner className="animate-spin text-xl mr-2" />
                                <span>Memproses pembayaran...</span>
                              </>
                            ) : (
                              <span>Bayar Sekarang</span>
                            )}
                        </button>
                    </div>
                </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;