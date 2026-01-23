import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  // dummy data
  const [menus] = useState([
    {id: 1, name: "Sirloin Steak", price: 85000, image: ""},
    {id: 2, name: "Tenderloin Steak", price: 85000, image: ""},
    {id: 3, name: "Chicken Steak", price: 45000, image: ""},
  ])

  const [cart, setCart] = useState([])

  const addToCart = (menu) => {
    const existing = cart.find(item => item.id === menu.id);
    if (existing){
      setCart(cart.map(item => item.id === menu.id ? {...item, qty: item.qty + 1} : item));
    } else {
      setCart([...cart, {...menu, qty: 1}]);
    }
  };

  const handleCheckout = async () => {
    try {
      const payload = {
        customer_name: "Customer Tetap",
        items: cart.map(item => ({
          menu_id: item.id,
          quantity: item.qty
        }))
      };

      // 2. Hit API
      const response = await axios.post('http://localhost:8080/api/orders', payload);
      const { snap_token } = response.data.data

      // 3. Munculkan pop-up midtrans
      if (window.snap) {
        window.snap.pay(snap_token, {
          onSuccess: (result) => { alert("Pembayaran berhasil"); console.log(result); setCart([]); },
          onPending: (result) => { alert("Menunggu pembayaran..."); console.log(result); },
          onError: (result) => { alert("Pembayaran gagal!"); console.log(result); },
          onClose: () => { alert("Anda menutup popup pembayaran"); }
        });
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Gagal membuat pesanan");
    }
  };

  return (
    <div className="p-10 container mx-10">
      <h1 className="text-3xl font-bold mb-6">Wan Steak Corner</h1>

      <div className="flex gap-8">
        {/* List Menu */}
        <div className="w-2/3 grid grid-cols-2 gap-4">
          {menus.map(menu => (
            <div key={menu.id} className="border p-4 rounded-lg shadow hover:shadow-lg transition">
              <img src={menu.image} alt={menu.name} className="w-full h-40 object-cover rounded mb-2"/>
              <h3 className="font-bold text-lg">{menu.name}</h3>
              <p className="text-gray-600">Rp {menu.price.toLocaleString()}</p>
              <button 
                onClick={() => addToCart(menu)}
                className="mt-3 bg-red-600 text-white px-4 py-2 rounded w-full hover:bg-red-700">
                Pesan
              </button>
            </div>
          ))}
        </div>

        {/* Cart */}
        <div className="w-1/3 border p-4 rounded-lg h-fit">
          <h2 className="text-xl font-bold mb-4">Keranjang</h2>
          {cart.length === 0 ? <p>Belum ada pesanan</p> : (
            <>
              {cart.map(item => (
                <div key={item.id} className="flex justify-between border-b py-2">
                  <span>{item.name} (x{item.qty})</span>
                  <span>Rp {(item.price * item.qty).toLocaleString()}</span>
                </div>
              ))}
              <button 
                onClick={handleCheckout}
                className="w-full bg-green-600 text-white font-bold py-3 mt-4 rounded hover:bg-green-700">
                BAYAR SEKARANG
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
