import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight, FaFire } from 'react-icons/fa';

const Hero = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    const heroSlides = [
        {
            title: "DIWALI SPECIAL SALE",
            subtitle: "60-80% OFF",
            description: "Premium Crackers & Fireworks",
            dates: "12th-21st DEC",
            cta: "Shop Now",
            badge: "MEGA SALE",
            image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80"
        },
        {
            title: "GIFT BOX COLLECTION",
            subtitle: "BUY 2 GET 1 FREE",
            description: "Perfect for Celebrations",
            dates: "LIMITED STOCK",
            cta: "View Collection",
            badge: "BEST SELLER",
            image: "https://images.unsplash.com/photo-1513885535751-8b9238bd345a?w=1200&q=80"
        },
        {
            title: "ECO-FRIENDLY CRACKERS",
            subtitle: "GREEN & SAFE",
            description: "Certified Low Emission",
            dates: "NEW ARRIVAL",
            cta: "Explore Now",
            badge: "ECO FRIENDLY",
            image: "https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=1200&q=80"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            if (!isTransitioning) {
                goToSlide((currentSlide + 1) % heroSlides.length);
            }
        }, 5000);
        return () => clearInterval(timer);
    }, [currentSlide, isTransitioning]);

    const goToSlide = (index) => {
        if (isTransitioning || index === currentSlide) return;
        setIsTransitioning(true);
        setCurrentSlide(index);
        setTimeout(() => setIsTransitioning(false), 700);
    };

    const nextSlide = () => {
        goToSlide((currentSlide + 1) % heroSlides.length);
    };

    const prevSlide = () => {
        goToSlide((currentSlide - 1 + heroSlides.length) % heroSlides.length);
    };

    return (
        <div className="relative h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-900">
            {heroSlides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide
                        ? 'opacity-100 z-10 scale-100'
                        : 'opacity-0 z-0 scale-105'
                        }`}
                >
                    <div className="absolute inset-0 overflow-hidden">
                        <img
                            src={slide.image}
                            alt={slide.title}
                            className={`w-full h-full object-cover transition-transform duration-[20000ms] ease-out ${index === currentSlide ? 'scale-110' : 'scale-100'
                                }`}
                            onError={(e) => {
                                e.target.src = '/Monkey.jpg';
                                e.target.onerror = null;
                            }}
                        />
                        <div className="absolute inset-0 bg-black/70"></div>
                        <div className="absolute inset-0 bg-black/40"></div>
                    </div>

                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10">
                        <div className="flex items-center h-full max-w-full md:max-w-2xl lg:max-w-3xl">
                            <div className={`text-white transition-all duration-1000 ${index === currentSlide
                                ? 'translate-x-0 translate-y-0 opacity-100'
                                : '-translate-x-12 translate-y-4 opacity-0'
                                }`}>
                                <div className={`inline-flex items-center gap-2 mb-3 sm:mb-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-orange-500 rounded-full font-bold text-xs sm:text-sm shadow-lg transition-all duration-700 delay-100 ${index === currentSlide ? 'scale-100 rotate-0' : 'scale-75 -rotate-12'
                                    }`}>
                                    <FaFire className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
                                    {slide.badge}
                                </div>

                                <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black mb-2 sm:mb-3 drop-shadow-2xl leading-tight transition-all duration-1000 delay-200 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    }`}>
                                    {slide.title}
                                </h1>

                                <p className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black mb-2 sm:mb-3 text-orange-500 drop-shadow-2xl leading-tight transition-all duration-1000 delay-300 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    }`}>
                                    {slide.subtitle}
                                </p>

                                <p className={`text-base sm:text-lg md:text-xl lg:text-2xl mb-1 sm:mb-2 font-semibold transition-all duration-1000 delay-400 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    }`}>
                                    {slide.description}
                                </p>

                                <p className={`text-xs sm:text-sm md:text-base mb-4 sm:mb-6 text-gray-300 transition-all duration-1000 delay-500 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
                                    }`}>
                                    {slide.dates}
                                </p>

                                <button
                                    onClick={() => navigate('/')}
                                    className={`group relative px-6 py-2.5 sm:px-8 sm:py-3 md:px-10 md:py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm sm:text-base md:text-lg rounded-full transition-all shadow-2xl hover:shadow-orange-500/50 active:scale-95 cursor-pointer ${index === currentSlide ? 'translate-y-0 opacity-100 delay-600' : 'translate-y-8 opacity-0'
                                        }`}
                                >
                                    <span className="flex items-center gap-2">
                                        {slide.cta}
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ))}

            <button
                onClick={prevSlide}
                disabled={isTransitioning}
                className="group absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center shadow-2xl transition-all z-20 hover:scale-110 disabled:opacity-50 active:scale-95 cursor-pointer"
            >
                <FaChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white group-hover:-translate-x-0.5 transition-transform" />
            </button>
            <button
                onClick={nextSlide}
                disabled={isTransitioning}
                className="group absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-white/10 backdrop-blur-md hover:bg-white/20 border border-white/20 rounded-full flex items-center justify-center shadow-2xl transition-all z-20 hover:scale-110 disabled:opacity-50 active:scale-95 cursor-pointer"
            >
                <FaChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white group-hover:translate-x-0.5 transition-transform" />
            </button>

            <div className="absolute bottom-4 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                <div className="flex items-center gap-2 sm:gap-3 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => goToSlide(index)}
                            disabled={isTransitioning}
                            className="group relative cursor-pointer"
                        >
                            <div className={`h-2 rounded-full transition-all duration-500 ${index === currentSlide
                                ? 'bg-orange-500 w-8 sm:w-12'
                                : 'bg-white/40 w-2 hover:bg-white/60 hover:w-4'
                                }`}>
                                {index === currentSlide && (
                                    <div className="absolute inset-0 bg-white/30 rounded-full animate-pulse"></div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Hero;
