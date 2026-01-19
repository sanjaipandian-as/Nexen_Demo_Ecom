import React from 'react';
import { useNavigate } from 'react-router-dom';

const FestiveOffers = () => {
    const navigate = useNavigate();

    const festiveProducts = [
        { name: "Premium Sparklers", discount: "Min. 60% Off", image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&q=80" },
        { name: "Sky Rockets", discount: "Min. 55% Off", image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=400&q=80" },
        { name: "Flower Pots", discount: "Min. 50% Off", image: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=400&q=80" },
        { name: "Spinning Chakras", discount: "Min. 65% Off", image: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=400&q=80" },
        { name: "Premium Gift Boxes", discount: "Min. 45% Off", image: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=400&q=80" },
        { name: "Atom Bombs", discount: "Min. 70% Off", image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&q=80" },
        { name: "Color Fountains", discount: "Min. 58% Off", image: "https://images.unsplash.com/photo-1482575832494-771f74bf6857?w=400&q=80" },
        { name: "Mega Combo Packs", discount: "Special Offer", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&q=80", special: true }
    ];

    return (
        <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-8 sm:py-10 md:py-12">
            <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
                        Festive offers
                    </h2>
                    <button
                        onClick={() => navigate('/')}
                        className="text-sm sm:text-base text-blue-600 hover:text-orange-500 font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                    >
                        View all
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
                    {festiveProducts.map((product, index) => (
                        <div key={index} className="group cursor-pointer" onClick={() => navigate('/')}>
                            <div className="bg-gray-50 rounded-xl overflow-hidden mb-3 aspect-square flex items-center justify-center p-4">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    onError={(e) => {
                                        e.target.src = '/Monkey.jpg';
                                        e.target.onerror = null;
                                    }}
                                />
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-1">{product.name}</h3>
                            <p className={`text-xs sm:text-sm font-bold ${product.special ? 'text-orange-600' : 'text-green-600'}`}>
                                {product.discount}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FestiveOffers;
