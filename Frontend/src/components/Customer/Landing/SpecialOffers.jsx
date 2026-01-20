import React from 'react';
import { useNavigate } from 'react-router-dom';

const SpecialOffers = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                {/* Card 1 - Trending Fashion */}
                <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 hover:shadow-xl transition-shadow">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                        Trending Fashion | Up to 60% off
                    </h2>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400&q=80"
                                    alt="Men's Wear"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Men's Wear</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80"
                                    alt="Women's Wear"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Women's Wear</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&q=80"
                                    alt="Kid's Wear"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Kid's Wear</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=400&q=80"
                                    alt="Active Wear"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Active Wear</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.preventDefault(); navigate('/'); }}
                        className="text-sm text-blue-600 hover:text-orange-500 hover:underline font-medium cursor-pointer transition-colors"
                    >
                        See more
                    </button>
                </div>

                {/* Card 2 - Premium Accessories */}
                <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 hover:shadow-xl transition-shadow">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                        Premium Accessories | Starting ₹499
                    </h2>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&q=80"
                                    alt="Bags"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Bags</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&q=80"
                                    alt="Sunglasses"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Sunglasses</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400&q=80"
                                    alt="Watches"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Watches</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1616422323382-74843b0ce49d?w=400&q=80"
                                    alt="Jewelry"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Jewelry</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.preventDefault(); navigate('/'); }}
                        className="text-sm text-blue-600 hover:text-orange-500 hover:underline font-medium cursor-pointer transition-colors"
                    >
                        See more
                    </button>
                </div>

                {/* Card 3 - Footwear Collection */}
                <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 hover:shadow-xl transition-shadow">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                        Footwear Collection | Best Sellers
                    </h2>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&q=80"
                                    alt="Sneakers"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Sneakers</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80"
                                    alt="Sport Shoes"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Sport Shoes</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80"
                                    alt="Formal Shoes"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Formal Shoes</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1539255097946-11801d94f37f?w=400&q=80"
                                    alt="Sandals"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Sandals</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.preventDefault(); navigate('/'); }}
                        className="text-sm text-blue-600 hover:text-orange-500 hover:underline font-medium cursor-pointer transition-colors"
                    >
                        See more
                    </button>
                </div>

                {/* Card 4 - Sustainable Fashion */}
                <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 hover:shadow-xl transition-shadow">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                        Sustainable Fashion | Eco-Friendly
                    </h2>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1581783342308-f792ca43d5bc?w=400&q=80"
                                    alt="Organic Cotton"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Organic Cotton</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=400&q=80"
                                    alt="Recycled"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Recycled Materials</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1516762689617-e1cffcef479d?w=400&q=80"
                                    alt="Handmade"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Handmade</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400&q=80"
                                    alt="Ethical"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Ethical Brands</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.preventDefault(); navigate('/'); }}
                        className="text-sm text-blue-600 hover:text-orange-500 hover:underline font-medium cursor-pointer"
                    >
                        See more
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpecialOffers;
