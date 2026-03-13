import React, { useState } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try{
            // 1. Kirim request ke BE
            const response = await api.post('auth/login', {
                email: email,
                password: password
            });

            // 2. Ambil token dari response
            const { token } = response.data;

            // 3. Simpan token ke localStorage
            // Kita namakan 'admin_token' agar berbeda dengan data guest
            localStorage.setItem('admin_token', token);

            const username = email.split('@')[0];
            const capitalizeName = username.charAt(0).toUpperCase() + username.slice(1);
            localStorage.setItem('admin_name', capitalizeName);

            // 4. Redirect ke Dashboard Admin
            toast.success(`Login Berhasil. Selamat Datang ${capitalizeName}!`);
            navigate("/admin/dashboard");
        } catch (err) {
            console.error(err);
            setError("Email atau Password salah!");
        }
    };

    return(
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Admin Login</h2>
                
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm text-center">{error}</div>
                )}

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="admin@wansteak.com"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
                        <input 
                            type="password" 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="*************"
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-red-600 text-white font-bold py-2 rounded hover:bg-red-700 transition">
                        LOGIN
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Login;