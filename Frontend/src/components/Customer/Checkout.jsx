import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaMapMarkerAlt, FaPhone, FaUser, FaLock, FaCheckCircle } from 'react-icons/fa';

/**
 * Checkout Component
 * Premium UI for shipping address input
 */
const Checkout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { product, quantity } = location.state || {};

    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        addressLine: '',
        city: '',
        state: '',
        pincode: ''
    });

    useEffect(() => {
        // Attempt to prefill from user data if possible
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userData = JSON.parse(userStr);
            setFormData(prev => ({
                ...prev,
                fullName: userData.fullname || userData.name || userData.username || '',
                phone: userData.phone || ''
            }));
        }
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const shippingAddress = {
            street: formData.addressLine,
            city: formData.city,
            state: formData.state,
            zipCode: formData.pincode,
            country: 'India',
            mobile: formData.phone
        };

        navigate('/payment', {
            state: {
                shippingAddress,
                product,
                quantity
            }
        });
    };

    return (
        <div className="min-h-screen bg-[#F8FAFC] font-['Inter'] selection:bg-rose-100 selection:text-rose-600">
            {/* Premium Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 sticky top-0 z-40">
                <div className="max-w-4xl mx-auto px-4 sm:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => navigate(-1)}
                            className="group flex items-center gap-3 text-slate-500 hover:text-rose-500 font-black text-xs uppercase tracking-widest transition-all"
                        >
                            <div className="w-8 h-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:border-rose-100 group-hover:bg-rose-50 transition-all">
                                <FaArrowLeft className="w-3 h-3" />
                            </div>
                            Return
                        </button>
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 rounded-full border border-emerald-100">
                            <FaLock className="w-3 h-3 text-emerald-500" />
                            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Safe & Secure</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 sm:px-8 py-12">
                <header className="text-center mb-12">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="h-[2px] w-8 bg-rose-500"></div>
                        <span className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Destination</span>
                        <div className="h-[2px] w-8 bg-rose-500"></div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Shipping <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">Details.</span></h1>
                    <p className="text-slate-400 font-bold text-sm mt-3">Where should we deliver your premium selection?</p>
                </header>

                <div className="bg-white rounded-[3rem] shadow-2xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                    <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-50">
                        {/* Process Steps (Mobile Hidden) */}
                        <div className="hidden lg:flex lg:w-48 bg-slate-50 p-8 flex-col justify-between">
                            <div className="space-y-12">
                                <div className="flex flex-col items-center gap-3">
                                    <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-200">
                                        <FaMapMarkerAlt />
                                    </div>
                                    <span className="text-[9px] font-black uppercase text-rose-500 tracking-widest">Address</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 opacity-30">
                                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center">
                                        <FaLock />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Payment</span>
                                </div>
                                <div className="flex flex-col items-center gap-3 opacity-30">
                                    <div className="w-10 h-10 rounded-2xl bg-white border border-slate-200 text-slate-400 flex items-center justify-center">
                                        <FaCheckCircle />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Done</span>
                                </div>
                            </div>
                        </div>

                        {/* Form Area */}
                        <div className="flex-1 p-8 md:p-12">
                            <form onSubmit={handleSubmit} className="space-y-10">
                                {/* Personal Segment */}
                                <div className="space-y-6">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                                            <FaUser className="w-3.5 h-3.5" />
                                        </div>
                                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Recipient Profile</h2>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Identity</label>
                                            <input
                                                type="text"
                                                name="fullName"
                                                required
                                                value={formData.fullName}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-rose-500 outline-none transition-all font-bold text-slate-800"
                                                placeholder="e.g. Alexander Pierce"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Sequence</label>
                                            <div className="relative">
                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300">
                                                    <FaPhone className="w-3.5 h-3.5" />
                                                </div>
                                                <input
                                                    type="tel"
                                                    name="phone"
                                                    required
                                                    pattern="[0-9]{10}"
                                                    value={formData.phone}
                                                    onChange={handleChange}
                                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-rose-500 outline-none transition-all font-bold text-slate-800"
                                                    placeholder="10-digit number"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Address Segment */}
                                <div className="space-y-6 pt-10 border-t border-slate-50">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-md">
                                            <FaMapMarkerAlt className="w-3.5 h-3.5" />
                                        </div>
                                        <h2 className="text-lg font-black text-slate-900 tracking-tight">Global Destination</h2>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Street Architecture</label>
                                        <textarea
                                            name="addressLine"
                                            required
                                            rows="3"
                                            value={formData.addressLine}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-rose-500 outline-none transition-all font-bold text-slate-800 resize-none"
                                            placeholder="Floor, Building, Street Address, Landmark..."
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">City Hub</label>
                                            <input
                                                type="text"
                                                name="city"
                                                required
                                                value={formData.city}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-rose-500 outline-none transition-all font-bold text-slate-800"
                                                placeholder="City name"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">State / Province</label>
                                            <input
                                                type="text"
                                                name="state"
                                                required
                                                value={formData.state}
                                                onChange={handleChange}
                                                className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-rose-500 outline-none transition-all font-bold text-slate-800"
                                                placeholder="State name"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pincode Sequence</label>
                                        <input
                                            type="text"
                                            name="pincode"
                                            required
                                            pattern="[0-9]{6}"
                                            value={formData.pincode}
                                            onChange={handleChange}
                                            className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-rose-500 outline-none transition-all font-bold text-slate-800"
                                            placeholder="6-digit PIN"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-6 bg-slate-900 text-white font-black text-xs uppercase tracking-[0.3em] rounded-[2rem] shadow-2xl shadow-slate-300 hover:bg-rose-500 active:scale-[0.98] transition-all duration-500 group flex items-center justify-center gap-4"
                                >
                                    Review Selection
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 group-hover:bg-white animate-pulse"></div>
                                </button>

                                <p className="text-center text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">
                                    One step closer to your aesthetic
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
