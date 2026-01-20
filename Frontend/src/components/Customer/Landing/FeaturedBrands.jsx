import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight, FaStar } from 'react-icons/fa';
import API from '../../../../api';
import Skeleton from '../../Common/Skeleton';

const FeaturedShops = () => {
    const navigate = useNavigate();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRealBrands = async () => {
            try {
                setLoading(true);
                const response = await API.get('/sellers/all');
                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    const realBrands = response.data.map(seller => ({
                        id: seller._id,
                        name: seller.businessName || 'Unnamed Brand',
                        img: '/Monkey.jpg', // Placeholder since real logos might be missing
                        rating: seller.rating || 4.5,
                        products: seller.totalProducts || 0,
                        sellerId: seller._id
                    }));
                    setBrands(realBrands);
                } else {
                    setBrands([]);
                }
            } catch (error) {
                console.error("Failed to load brands:", error);
                setBrands([]);
            } finally {
                setLoading(false);
            }
        };
        fetchRealBrands();
    }, []);

    const handleBrandClick = useCallback((brand) => {
        navigate(`/shop/${brand.sellerId}`, {
            state: { shopName: brand.name, shopData: brand }
        });
    }, [navigate]);

    return (
        <section className="w-full py-16 bg-white">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-end mb-8">
                    <div>
                        <p className="text-secondary font-bold tracking-widest uppercase text-sm mb-1">
                            Verified Sellers
                        </p>
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">
                            TOP BRANDS
                        </h2>
                    </div>
                    <button className="hidden sm:flex items-center gap-2 text-sm font-bold border-b-2 border-black pb-1 hover:text-primary hover:border-primary transition-colors">
                        VIEW ALL <FaArrowRight />
                    </button>
                </div>

                {loading ? (
                    <div className="flex gap-6 overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="w-60 h-80 rounded-none" />
                        ))}
                    </div>
                ) : brands.length === 0 ? (
                    <p className="text-center text-gray-500 italic">No brands available.</p>
                ) : (
                    <div className="overflow-x-auto pb-4 scrollbar-hide">
                        <div className="flex gap-6 min-w-max">
                            {brands.map((brand) => (
                                <div
                                    key={brand.id}
                                    onClick={() => handleBrandClick(brand)}
                                    className="group relative w-[240px] h-[320px] bg-gray-100 cursor-pointer overflow-hidden"
                                >
                                    <img
                                        src={brand.img}
                                        alt={brand.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
                                        onError={(e) => e.target.src = '/Monkey.jpg'}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90"></div>

                                    <div className="absolute bottom-0 left-0 w-full p-5 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="text-white font-black text-xl uppercase tracking-wide mb-1">
                                            {brand.name}
                                        </h3>
                                        <div className="flex items-center gap-2 text-gray-300 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">
                                            <span className="flex items-center gap-1 text-secondary">
                                                <FaStar /> {brand.rating}
                                            </span>
                                            <span>• {brand.products} Items</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};

export default FeaturedShops;
