import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MdPerson, MdLock, MdVisibility, MdVisibilityOff, MdAdminPanelSettings } from 'react-icons/md';
import { FaShieldAlt } from 'react-icons/fa';
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
            toast.success('Access Granted to Admin Portal');
        } else {
            setError('Invalid Secret Portal Key');
            toast.error('Invalid Secret Portal Key');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        // Check if user is already logged in as another role
        const existingRole = sessionStorage.getItem('userRole') || localStorage.getItem('userRole');
        if (existingRole && existingRole !== 'admin') {
            const roleNames = {
                'customer': 'Customer',
                'seller': 'Seller'
            };
            toast.error(`You are already logged in as ${roleNames[existingRole]}. Please logout and try again.`, {
                position: "top-center",
                autoClose: 4000,
            });
            return;
        }

        setLoading(true);

        try {
            const response = await API.post('/admin/auth/login', {
                username: formData.username,
                password: formData.password
            });

            if (response.data.token) {
                // Store token and admin data in localStorage
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.admin));
                localStorage.setItem('userRole', 'admin');

                // Store login timestamp for session management
                const loginTime = new Date().getTime();
                localStorage.setItem('loginTime', loginTime.toString());

                toast.success('Admin login successful!');

                // Navigate to admin dashboard
                navigate('/admin-dashboard');
            }
        } catch (err) {
            console.error('Admin login error:', err);
            let errorMessage = '';
            if (err.response?.status === 404) {
                errorMessage = 'Admin account not found. Please check your username.';
            } else if (err.response?.status === 400) {
                errorMessage = 'Invalid credentials. Please try again.';
            } else {
                errorMessage = err.response?.data?.message || 'Login failed. Please try again.';
            }
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (!gatekeeperPassed) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900/40 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute top-20 left-10 w-72 h-72 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-20 right-10 w-96 h-96 bg-red-800/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>

                <div className="w-full max-w-md relative z-10 text-center">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-600 to-slate-900 rounded-3xl mb-8 shadow-2xl shadow-red-500/30 border border-red-500/20 transform rotate-45">
                        <FaShieldAlt className="w-12 h-12 text-white transform -rotate-45" />
                    </div>

                    <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight">Access Restricted</h2>
                    <p className="text-gray-400 mb-8 max-w-xs mx-auto">This area is for authorized administrators only. Please enter the Secret Portal Key to proceed.</p>

                    <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-3xl">
                        <form onSubmit={handleGatekeeperSubmit} className="space-y-6">
                            <div className="relative">
                                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-red-400 w-6 h-6" />
                                <input
                                    type="password"
                                    value={secretPortalKey}
                                    onChange={(e) => setSecretPortalKey(e.target.value)}
                                    placeholder="Enter Secret Portal Key"
                                    className="w-full pl-14 pr-4 py-4 bg-black/40 border-2 border-white/5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all text-white placeholder-gray-500 font-mono tracking-widest text-lg"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-900/40 hover:scale-[1.02] active:scale-[0.98] uppercase tracking-widest text-sm"
                            >
                                Verify Identity
                            </button>
                        </form>
                        {error && (
                            <div className="mt-4 p-3 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200 text-sm font-medium">
                                {error}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo and Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-2xl mb-4 shadow-2xl shadow-primary/50">
                        <FaShieldAlt className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Admin Portal</h1>
                    <p className="text-gray-300">Secure access to administrative dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 p-8">
                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Username Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-2">
                                Username
                            </label>
                            <div className="relative">
                                <MdPerson className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    placeholder="Enter admin username"
                                    className="w-full pl-12 pr-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-white placeholder-gray-400 backdrop-blur-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <MdLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    placeholder="Enter admin password"
                                    className="w-full pl-12 pr-12 py-3 bg-white/10 border-2 border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-white placeholder-gray-400 backdrop-blur-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? (
                                        <MdVisibilityOff className="w-5 h-5" />
                                    ) : (
                                        <MdVisibility className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                />
                                <span className="ml-2 text-sm text-gray-300">Remember me</span>
                            </label>
                            <button
                                type="button"
                                className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors"
                            >
                                Forgot Password?
                            </button>
                        </div>

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 text-white font-bold rounded-xl transition-all shadow-lg ${loading
                                ? 'bg-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-primary/50 hover:shadow-xl hover:shadow-primary/60 transform hover:-translate-y-0.5'
                                }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Authenticating...</span>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-2">
                                    <MdAdminPanelSettings className="w-5 h-5" />
                                    <span>Sign In as Admin</span>
                                </div>
                            )}
                        </button>
                    </form>

                    {/* Security Notice */}
                    <div className="mt-6 p-4 bg-secondary/10 border border-secondary/30 rounded-lg backdrop-blur-sm">
                        <div className="flex items-start gap-3">
                            <FaShieldAlt className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm text-secondary font-semibold mb-1">Security Notice</p>
                                <p className="text-xs text-secondary/80">This is a restricted area. All login attempts are monitored and logged.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Adminlogin;
