import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import MenuCard from '../components/MenuCard';
import CartSidebar from '../components/CartSidebar';
import toast from 'react-hot-toast';
import { FaSearch, FaSpinner, FaUtensils } from 'react-icons/fa';
import { MdAccessTime, MdWarningAmber } from 'react-icons/md';

const CATEGORY_TABS = ["Semua", "Makanan Utama", "Minuman", "Snack"];
const Home = () => {
  const [menus, setMenus] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Menu dari Backend saat loading awal
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

  // Filter menu berdasarkan kategori yang dipilih
  const filteredMenus = menus.filter(menu => {
    // Check 1: Is category match?
    const menuCategory = menu.category || "Makanan Utama"; 
    const matchCategory = activeCategory === "Semua" || menuCategory === activeCategory;

    // Check 2: Does menu name match search query?
    const matchSearch = menu.name.toLowerCase().includes(searchQuery.toLowerCase());

    return matchCategory && matchSearch;
  });

  // Logic Cart (Tambah & Hapus)
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
        
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
          {/* Search Bar */}
          <div className="relative w-full md:w-80 lg:w-96 order-1 md:order-2">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400" />
            </div>
            <input 
              type="text" 
              placeholder="Cari menu favoritmu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-4 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent shadow-sm transition-all text-sm md:text-base"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-red-500 font-bold"
              >
                &times;
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto hide-scrollbar -mx-4 px-4 md:mx-0 md:px-0 order-2 md:order-1 w-full md:w-auto">
            <div className="inline-flex bg-white p-1.5 rounded-full shadow-sm border border-gray-100 w-max">
              {CATEGORY_TABS.map((category) => (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all shadow-sm duration-300 flex-shrink-0 ${
                    activeCategory === category
                      ? 'bg-red-700 text-white shadow-md'
                      : 'text-gray-600 bg-transparent hover:bg-gray-50 hover:text-red-700'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredMenus.map((menu) => (
            <MenuCard key={menu.id} menu={menu} addToCart={addToCart} />
          ))}
        </div>

        {filteredMenus.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-gray-50 rounded-2xl border border-gray-200 mt-4 mx-auto max-w-2xl text-center">
            <div className="bg-gray-200/50 p-5 rounded-full mb-4">
              <FaUtensils className="text-5xl text-gray-400" />
            </div>
            <h3 className="text-2xl font-extrabold text-gray-800 mb-2">Oops!</h3>
            <p className="text-gray-500 font-medium">
              {searchQuery
                ? `Tidak ada menu yang cocok dengan "${searchQuery}" di kategori "${activeCategory}". Coba kata kunci lain?`
                : `Menu untuk kategori "${activeCategory}" belum tersedia.`
              }
            </p>
          </div>
        )}
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