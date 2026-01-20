import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPerson, MdLock, MdVisibility, MdVisibilityOff, MdArrowForward } from 'react-icons/md';
import { toast } from 'react-toastify';
import API from '../../../../api';

const Adminlogin = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [gatekeeperPassed, setGatekeeperPassed] = useState(false);
    const [secretPortalKey, setSecretPortalKey] = useState('');
    const [formData, setFormData] = useState({
        username: '',
        password: ''
    });

    const GATEKEEPER_KEY = '9#Tq!RzA4$K@xP8mL^C2&fW7EJH';

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (error) setError('');
    };

    const handleGatekeeperSubmit = (e) => {
        e.preventDefault();
        if (secretPortalKey === GATEKEEPER_KEY) {
            setGatekeeperPassed(true);
            setError('');
            toast.success('Access Granted');
        } else {
            setError('Invalid Secret Key');
            toast.error('Access Denied');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const existingRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole');
        if (existingRole && existingRole !== 'admin') {
            toast.error(`Logged in as ${existingRole}. Please logout first.`);
            return;
        }

        setLoading(true);

        try {
            const response = await API.post('/admin/auth/login', {
                username: formData.username,
                password: formData.password
            });

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.admin));
                localStorage.setItem('userRole', 'admin');
                const loginTime = new Date().getTime();
                localStorage.setItem('loginTime', loginTime.toString());

                toast.success('Welcome back, Admin.');
                navigate('/admin-dashboard');
            }
        } catch (err) {
            console.error('Admin login error:', err);
            setError(err.response?.data?.message || 'Authentication failed.');
            toast.error('Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    if (!gatekeeperPassed) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 font-body relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 blur-xl"></div>

                <div className="w-full max-w-sm relative z-10 animate-slideUp">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-rose-900/50 rotate-3">
                            <MdLock className="text-3xl text-white" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tight font-hero mb-2">Restricted Access</h2>
                        <p className="text-slate-400 font-medium text-sm">Authorized personnel only.</p>
                    </div>

                    <form onSubmit={handleGatekeeperSubmit} className="space-y-4">
                        <div className="relative group">
                            <input
                                type="password"
                                value={secretPortalKey}
                                onChange={(e) => setSecretPortalKey(e.target.value)}
                                placeholder="Enter Security Key"
                                className="w-full px-6 py-5 bg-slate-800/50 border border-slate-700/50 rounded-2xl focus:bg-slate-800 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 outline-none text-white text-center font-bold tracking-widest placeholder:text-slate-600 transition-all duration-300 backdrop-blur-md"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-5 bg-white text-slate-900 font-black rounded-2xl hover:bg-rose-500 hover:text-white transition-all shadow-xl hover:shadow-rose-500/20 active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                            <span>Verify Identity</span>
                            <MdArrowForward className="text-lg" />
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-body">
            <div className="w-full max-w-[400px] animate-slideUp">

                {/* Brand */}
                <div className="text-center mb-10">
                    <div className="w-16 h-16 bg-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-rose-200 rotate-3 transition-transform hover:rotate-6 duration-500">
                        <span className="text-white font-black text-2xl font-hero">G</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight font-hero mb-2">Admin Portal</h1>
                    <p className="text-slate-500 font-medium text-sm">Sign in to manage your store.</p>
                </div>

                {/* Card */}
                <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold text-center animate-fadeIn">
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Username</label>
                                <div className="relative group">
                                    <MdPerson className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors text-lg" />
                                    <input
                                        type="text"
                                        name="username"
                                        value={formData.username}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                        placeholder="Enter your username"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Password</label>
                                <div className="relative group">
                                    <MdLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors text-lg" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        className="w-full pl-12 pr-12 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all font-bold text-slate-900 placeholder:text-slate-300"
                                        placeholder="Enter your password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative">
                                    <input type="checkbox" className="peer sr-only" />
                                    <div className="w-5 h-5 border-2 border-slate-200 rounded-lg peer-checked:bg-rose-600 peer-checked:border-rose-600 transition-all"></div>
                                    <svg className="absolute top-[2px] left-[2px] w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <span className="text-xs font-bold text-slate-500 group-hover:text-slate-700 transition-colors">Remember me</span>
                            </label>
                            <a href="#" className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline">Forgot Password?</a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-rose-600 transition-all shadow-xl hover:shadow-rose-500/20 active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <span>Sign In to Dashboard</span>
                            )}
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-[11px] font-black text-slate-300 uppercase tracking-widest hover:text-rose-400 transition-colors cursor-pointer" onClick={() => navigate('/')}>
                    ← Return to Store
                </p>
            </div>
        </div>
    );
};

export default Adminlogin;
