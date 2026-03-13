import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import MenuCard from '../components/MenuCard';
import CartSidebar from '../components/CartSidebar';
import toast from 'react-hot-toast';
import { FaSpinner } from 'react-icons/fa';
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
    toast.success("Menu dihapus dari keranjang");
  };

  const updateQuantity = (id, delta) => {
    setCart(prevCart => {
      return prevCart.map(item => {
        if (item.id === id) {
          // Tambah atau kurangi qty berdasarkan delta (1 atau -1)
          return { ...item, qty: item.qty + delta};
        }
        return item;
      }).filter(item => item.qty > 0); // Jika qty jadi 0, otomatis item terhapus
    });
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

      setCart([]);
      setCustomerName("");
      setShowCart(false);

      // Tampilkan Popup Midtrans
      if (window.snap) {
        window.snap.pay(snap_token, {
          onSuccess: function(result) {
            toast.success("Pembayaran Berhasil!");
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
            toast("Silahkan selesaikan pembayaran di menu Riwayat Pesanan", {
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
        <CartSidebar 
          cart={cart}
          setShowCart={setShowCart}
          removeFromCart={removeFromCart}
          updateQuantity={updateQuantity}
          calculateTotal={calculateTotal}
          customerName={customerName}
          setCustomerName={setCustomerName}
          handleCheckout={handleCheckout}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default Home;