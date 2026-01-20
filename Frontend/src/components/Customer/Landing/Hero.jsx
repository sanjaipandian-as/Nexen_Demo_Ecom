import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import API from '../../../../api';

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
                        image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80",
                        order: 1
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
        return <div className="h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px] bg-gray-900 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>;
    }

    if (heroSlides.length === 0) return null;

    return (
        <div className="relative h-[400px] sm:h-[450px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-900 group">
            {heroSlides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${index === currentSlide
                        ? 'opacity-100 z-10 scale-100'
                        : 'opacity-0 z-0 scale-105'
                        }`}
                >
                    <div className="absolute inset-0 overflow-hidden cursor-pointer" onClick={() => navigate('/')}>
                        {/* Image Only - No Text Overlays */}
                        <img
                            src={slide.image}
                            alt="Hero Banner"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.target.src = '/Monkey.jpg';
                                e.target.onerror = null;
                            }}
                        />
                        {/* Light dark overlay for better visibility of arrows (optional, kept minimal) */}
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                </div>
            ))}

            {heroSlides.length > 1 && (
                <>
                    <button
                        onClick={prevSlide}
                        disabled={isTransitioning}
                        className="opacity-0 group-hover:opacity-100 absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all z-20 hover:scale-110 disabled:opacity-50 cursor-pointer"
                    >
                        <FaChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={nextSlide}
                        disabled={isTransitioning}
                        className="opacity-0 group-hover:opacity-100 absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 bg-black/30 backdrop-blur-md hover:bg-black/50 text-white rounded-full flex items-center justify-center transition-all z-20 hover:scale-110 disabled:opacity-50 cursor-pointer"
                    >
                        <FaChevronRight className="w-5 h-5" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
                        {heroSlides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`transition-all duration-300 rounded-full h-2 ${index === currentSlide ? 'w-8 bg-orange-500' : 'w-2 bg-white/50 hover:bg-white'
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
