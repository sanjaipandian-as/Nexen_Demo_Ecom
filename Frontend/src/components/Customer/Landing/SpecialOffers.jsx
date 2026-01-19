import React from 'react';
import { useNavigate } from 'react-router-dom';

const SpecialOffers = () => {
    const navigate = useNavigate();

    return (
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                {/* Card 1 - Diwali Crackers Bundle */}
                <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 hover:shadow-xl transition-shadow">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                        Diwali Crackers Bundle | Up to 60% off
                    </h2>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80"
                                    alt="Sparklers"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        e.target.src = '/Monkey.jpg';
                                        e.target.onerror = null;
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Sparklers</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80"
                                    alt="Rockets"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        e.target.src = '/Monkey.jpg';
                                        e.target.onerror = null;
                                    }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Rockets</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&q=80"
                                    alt="Flower Pots"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Flower pots</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=400&q=80"
                                    alt="Chakras"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Chakras</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.preventDefault(); navigate('/'); }}
                        className="text-sm text-blue-600 hover:text-orange-500 hover:underline font-medium cursor-pointer transition-colors"
                    >
                        See more
                    </button>
                </div>

                {/* Card 2 - Premium Gift Boxes */}
                <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 hover:shadow-xl transition-shadow">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                        Premium Gift Boxes | Starting ₹499
                    </h2>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80"
                                    alt="Gift Box 1"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Deluxe box</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80"
                                    alt="Gift Box 2"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Family pack</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80"
                                    alt="Gift Box 3"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Premium set</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80"
                                    alt="Gift Box 4"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Combo pack</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.preventDefault(); navigate('/'); }}
                        className="text-sm text-blue-600 hover:text-orange-500 hover:underline font-medium cursor-pointer transition-colors"
                    >
                        See more
                    </button>
                </div>

                {/* Card 3 - Sky Shots Collection */}
                <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 hover:shadow-xl transition-shadow">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                        Sky Shots Collection | Best Sellers
                    </h2>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1482575832494-771f74bf6857?w=400&q=80"
                                    alt="Sky Shot 1"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Multi color</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80"
                                    alt="Sky Shot 2"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Night sky</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1513885535751-8b9238bold345a?w=400&q=80"
                                    alt="Sky Shot 3"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Mega shots</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&q=80"
                                    alt="Sky Shot 4"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Deluxe set</p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.preventDefault(); navigate('/'); }}
                        className="text-sm text-blue-600 hover:text-orange-500 hover:underline font-medium cursor-pointer transition-colors"
                    >
                        See more
                    </button>
                </div>

                {/* Card 4 - Eco-Friendly Range */}
                <div className="bg-white rounded-2xl shadow-lg p-5 sm:p-6 hover:shadow-xl transition-shadow">
                    <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                        Eco-Friendly Range | Green Crackers
                    </h2>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=400&q=80"
                                    alt="Eco Product 1"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Green sparklers</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80"
                                    alt="Eco Product 2"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Safe fountains</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&q=80"
                                    alt="Eco Product 3"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Low smoke</p>
                        </div>
                        <div className="cursor-pointer group">
                            <div className="bg-gray-50 rounded-lg overflow-hidden mb-2 aspect-square flex items-center justify-center">
                                <img
                                    src="https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80"
                                    alt="Eco Product 4"
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }}
                                />
                            </div>
                            <p className="text-xs text-gray-700">Eco rockets</p>
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
