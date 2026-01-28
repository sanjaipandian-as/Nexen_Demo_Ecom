import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import API from '../../../../api';
import Skeleton from '../../Common/Skeleton';

const Hero = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [heroSlides, setHeroSlides] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSlides = async () => {
            try {
                const response = await API.get('/hero');
                setHeroSlides(response.data.slides || []);
            } catch (error) {
                console.error('Error fetching hero slides:', error);
                // Fallback (Image Only)
                setHeroSlides([
                    {
                        image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=1200&auto=format&fit=crop",
                        order: 1
                    },
                    {
                        image: "https://images.unsplash.com/photo-1490481651871-ab5266461c60?q=80&w=1200&auto=format&fit=crop",
                        order: 2
                    },
                    {
                        image: "https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=1200&auto=format&fit=crop",
                        order: 3
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSlides();
    }, []);

    useEffect(() => {
        if (heroSlides.length <= 1) return;

        const timer = setInterval(() => {
            if (!isTransitioning) {
                goToSlide((currentSlide + 1) % heroSlides.length);
            }
        }, 5000);
        return () => clearInterval(timer);
    }, [currentSlide, isTransitioning, heroSlides.length]);

    const goToSlide = (index) => {
        if (isTransitioning || index === currentSlide || heroSlides.length <= 1) return;
        setIsTransitioning(true);
        setCurrentSlide(index);
        setTimeout(() => setIsTransitioning(false), 700);
    };

    const nextSlide = () => {
        if (heroSlides.length > 1) {
            goToSlide((currentSlide + 1) % heroSlides.length);
        }
    };

    const prevSlide = () => {
        if (heroSlides.length > 1) {
            goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
        }
    };

    if (isLoading) {
        return (
            <div className="mt-2 sm:mt-4 px-0">
                <Skeleton className="h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] w-full" />
            </div>
        );
    }

    if (heroSlides.length === 0) return null;

    return (
        <div className="relative mt-2 sm:mt-4 h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden bg-gray-900 group">
            {heroSlides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide
                        ? 'opacity-100 z-10 scale-100'
                        : 'opacity-0 z-0 scale-105'
                        }`}
                >
                    <div className="absolute inset-0 overflow-hidden cursor-pointer" onClick={() => navigate('/')}>
                        <img
                            src={slide.image}
                            alt="Hero Banner"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = '/Monkey.jpg';
                                e.target.onerror = null;
                            }}
                        />
                        {/* Gradient Overlay for Text Readability - Only for non-first slides */}
                        {index !== 0 && (
                            <>
                                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>

                                {/* Text Overlay - Left Side */}
                                <div className="absolute inset-0 flex items-center">
                                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                                        <div className="max-w-lg space-y-4 sm:space-y-6 animate-fadeInLeft">
                                            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight drop-shadow-lg">
                                                {[
                                                    "New Season Arrivals",
                                                    "Exclusive Collection",
                                                    "Limited Time Offers"
                                                ][index % 3]}
                                            </h2>
                                            <p className="text-base sm:text-lg md:text-xl text-gray-200 leading-relaxed font-light drops-shadow-md">
                                                {[
                                                    "Discover the latest trends in fashion. Elevate your wardrobe with our premium selection.",
                                                    "Premium quality styles designed for you. Shop the look that defines your unique personality.",
                                                    "Get up to 50% off on selected items. Don't miss out on the best deals of the season."
                                                ][index % 3]}
                                            </p>
                                            <button
                                                className="px-6 sm:px-8 py-2.5 sm:py-3 bg-[#E91E63] hover:bg-[#D81B60] text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95 text-sm sm:text-base"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate('/');
                                                }}
                                            >
                                                {[
                                                    "Shop Now",
                                                    "Explore Collection",
                                                    "View Offers"
                                                ][index % 3]}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            ))}

            {heroSlides.length > 1 && (
                <>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                        {heroSlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`transition-all duration-300 rounded-full h-2 ${index === currentSlide ? 'w-8 bg-[#E91E63]' : 'w-2 bg-white/50 hover:bg-white'
                                    }`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

export default Hero;
