import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaStar, FaChevronLeft, FaChevronRight, FaStore } from 'react-icons/fa';
import API from '../../../../api';
import Skeleton from '../../Common/Skeleton';


const FeaturedShops = () => {
    const navigate = useNavigate();
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRealBrands = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await API.get('/sellers/all');

                if (response.data && Array.isArray(response.data) && response.data.length > 0) {
                    const realBrands = response.data.map(seller => ({
                        id: seller._id,
                        name: seller.businessName || 'Unnamed Brand',
                        img: '/Monkey.jpg',
                        rating: seller.rating || 4.5,
                        products: `${seller.totalProducts || 0} Products`,
                        sellerId: seller._id,
                        location: seller.address?.city || seller.address?.state || 'India',
                        businessType: seller.businessType
                    }));

                    setBrands(realBrands);
                } else {
                    setBrands([]);
                }
            } catch (error) {
                setError(error.message);
                setBrands([]);
            } finally {
                setLoading(false);
            }
        };

        fetchRealBrands();
    }, []);

    const scroll = useCallback((direction) => {
        const container = document.getElementById('brands-carousel');
        if (container) {
            const scrollAmount = direction === 'left' ? -250 : 250;
            container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    }, []);

    const handleBrandClick = useCallback((brand) => {
        navigate(`/shop/${brand.sellerId}`, {
            state: { shopName: brand.name, shopData: brand }
        });
    }, [navigate]);

    const skeletonCards = useMemo(() => (
        [...Array(6)].map((_, index) => (
            <div
                key={index}
                className="flex-shrink-0 w-[300px] sm:w-[280px] md:w-[280px] lg:w-[280px] xl:w-[282px] bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
            >
                <Skeleton className="h-40 sm:h-44 md:h-40 w-full rounded-none" />
                <div className="p-4 space-y-3">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </div>

        ))
    ), []);

    return (
        <div className="w-full py-8 sm:py-10 md:py-12">
            <div className="container mx-auto px-1 sm:px-2 md:px-3 lg:px-4">
                <div className="mb-6 sm:mb-8">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center md:text-left">
                        Featured Brands
                    </h2>
                    <p className="mt-2 text-sm sm:text-base text-gray-600 text-center md:text-left max-w-3xl">
                        Discover trusted brands offering premium quality crackers and fireworks
                    </p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => scroll('left')}
                        className="hidden lg:flex absolute -left-5 xl:-left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-orange-500 rounded-full items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer"
                        aria-label="Previous shops"
                    >
                        <FaChevronLeft className="w-5 h-5 text-gray-700" />
                    </button>

                    <button
                        onClick={() => scroll('right')}
                        className="hidden lg:flex absolute -right-5 xl:-right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-orange-500 rounded-full items-center justify-center shadow-lg transition-all hover:scale-110 active:scale-95 cursor-pointer"
                        aria-label="Next shops"
                    >
                        <FaChevronRight className="w-5 h-5 text-gray-700" />
                    </button>

                    {loading ? (
                        <div className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto scrollbar-hide pb-4 px-6 md:px-0">
                            {skeletonCards}
                        </div>
                    ) : brands.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 md:py-16 text-center">
                            <FaStore className="text-6xl text-gray-300 mb-4" />
                            <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                                No Brands Available
                            </h3>
                            <p className="text-gray-600 max-w-md">
                                {error
                                    ? `Error loading brands: ${error}`
                                    : 'No brands are currently registered. Please check back later.'}
                            </p>
                        </div>
                    ) : (
                        <div
                            id="brands-carousel"
                            className="flex gap-4 sm:gap-5 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory pb-4 px-6 md:px-0"
                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                            {brands.map((brand) => (
                                <div
                                    key={brand.id}
                                    onClick={() => handleBrandClick(brand)}
                                    className="flex-shrink-0 w-[300px] sm:w-[280px] md:w-[280px] lg:w-[280px] xl:w-[282px] bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group snap-start"
                                >
                                    <div className="h-40 sm:h-44 md:h-40 w-full overflow-hidden bg-gray-100">
                                        <img
                                            src={brand.img}
                                            alt={brand.name}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.src = '/Monkey.jpg';
                                                e.target.onerror = null;
                                            }}
                                        />
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-sm font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-orange-600 transition-colors">
                                            {brand.name}
                                        </h3>

                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded">
                                                <FaStar className="w-3 h-3 text-yellow-500" />
                                                <span className="text-xs font-bold text-gray-900">{brand.rating}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">•</span>
                                            <span className="text-xs text-gray-600 font-medium">{brand.products}</span>
                                        </div>

                                        {brand.location && (
                                            <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
                                                <FaStore className="w-3 h-3" />
                                                {brand.location}
                                            </p>
                                        )}

                                        <button className="w-full px-3 py-2 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm hover:shadow-md">
                                            View Products
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="lg:hidden flex justify-center gap-2 mt-4">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <FaChevronLeft className="w-3 h-3" />
                            <span>Swipe to explore</span>
                            <FaChevronRight className="w-3 h-3" />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                
                #brands-carousel {
                    -webkit-overflow-scrolling: touch;
                }
                
                @media (max-width: 1023px) {
                    #brands-carousel {
                        scroll-padding: 1rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default FeaturedShops;
