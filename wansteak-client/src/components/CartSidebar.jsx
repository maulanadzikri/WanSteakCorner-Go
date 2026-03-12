import React from 'react';
import { FaTimes, FaTrash, FaSpinner } from 'react-icons/fa';
import { HiOutlineShoppingCart } from 'react-icons/hi';
import EmptyState from './EmptyState';

const CartSidebar = ({ 
    cart, 
    setShowCart, 
    removeFromCart, 
    calculateTotal, 
    customerName, 
    setCustomerName, 
    handleCheckout, 
    isLoading 
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex justify-end">
            <div className="bg-white w-full max-w-md h-full p-6 shadow-xl overflow-y-auto relative">
                <button 
                    onClick={() => setShowCart(false)}
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-500 transition-colors">
                    <FaTimes size={24} />
                </button>
                
                <h2 className="text-2xl font-bold mb-6">Keranjang Pesanan</h2>

                {cart.length === 0 ? (
                    <EmptyState  
                        icon={HiOutlineShoppingCart}
                        title="Keranjang Kosong"
                        message="Perut keroncongan? Yuk, pilih menu favoritmu dan masukkan ke keranjang!"
                    />
                ) : (
                    <>
                        <div className="space-y-4 mb-6">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-center border-b pb-2">
                                    <div>
                                        <h4 className="font-bold">{item.name}</h4>
                                        <p className="text-sm text-gray-600">
                                            Rp {item.price.toLocaleString('id-ID')} x {item.qty}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-red-600">
                                            Rp {(item.price * item.qty).toLocaleString('id-ID')}
                                        </span>
                                        <button 
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-500 hover:text-red-700 transition-colors">
                                            <FaTrash />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="border-t pt-4">
                            <div className="flex justify-between text-xl font-bold mb-4">
                                <span>Total:</span>
                                <span>Rp {calculateTotal().toLocaleString('id-ID')}</span>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-bold mb-2">Nama Pelanggan</label>
                                <input 
                                    type="text"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    placeholder="Masukkan nama Anda"
                                    className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 bg-gray-50"
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
                                        <span>Memproses...</span>
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
    );
};

export default CartSidebar;