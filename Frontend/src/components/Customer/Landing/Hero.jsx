import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';

const Hero = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const heroSlides = [
        {
            title: "THE WEDDING EDIT",
            subtitle: "ETHNIC WEAR",
            description: "Handpicked styles for the festive season",
            image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=2070&auto=format&fit=crop",
            cta: "Shop The Collection",
            align: "center"
        },
        {
            title: "URBAN STREETWEAR",
            subtitle: "NEW DROP",
            description: "Bold looks for the modern trendsetter",
            image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2020&auto=format&fit=crop",
            cta: "Explore Now",
            align: "left"
        },
        {
            title: "WINTER ESSENTIALS",
            subtitle: "COZY & CHIC",
            description: "Layer up in style this season",
            image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop",
            cta: "View Offer",
            align: "left"
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const goToSlide = (index) => {
        setCurrentSlide(index);
    };

    const scrollToProducts = () => {
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="relative h-[65vh] sm:h-[75vh] md:h-[85vh] w-full overflow-hidden bg-gray-100">
            {heroSlides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}
                >
                    {/* Background Image */}
                    <img
                        src={slide.image}
                        alt={slide.title}
                        className={`w-full h-full object-cover transition-transform duration-[10000ms] ease-linear ${index === currentSlide ? 'scale-110' : 'scale-100'
                            }`}
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent sm:bg-gradient-to-r sm:from-black/40 sm:to-transparent"></div>

                    {/* Content */}
                    <div className={`absolute inset-0 flex items-end sm:items-center pb-20 sm:pb-0 px-6 sm:px-12 md:px-20 lg:px-32 
                        ${slide.align === 'center' ? 'sm:justify-center text-center' : slide.align === 'right' ? 'sm:justify-end text-right' : 'sm:justify-start text-left'}`}>
                        <div className={`max-w-2xl transform transition-all duration-1000 delay-300 ${index === currentSlide ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                            } ${slide.align === 'center' ? 'mx-auto' : ''}`}>

                            <p className="text-secondary font-bold tracking-[0.2em] text-sm sm:text-base mb-2 sm:mb-4 uppercase animate-fadeIn">
                                {slide.subtitle}
                            </p>

                            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white mb-4 sm:mb-6 leading-tight drop-shadow-lg">
                                {slide.title}
                            </h1>

                            <p className="text-white/90 text-lg sm:text-xl md:text-2xl mb-6 sm:mb-8 font-light tracking-wide">
                                {slide.description}
                            </p>

                            <button
                                onClick={scrollToProducts}
                                className="group inline-flex items-center gap-2 px-8 py-3 sm:px-10 sm:py-4 bg-white text-black hover:bg-primary hover:text-white transition-all duration-300 text-sm sm:text-base cursor-pointer font-bold uppercase tracking-wider"
                            >
                                {slide.cta}
                                <FaArrowRight className="w-3 h-3 sm:w-4 sm:h-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Slide Indicators */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex gap-3">
                {heroSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`transition-all duration-500 rounded-full h-1.5 cursor-pointer ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/80'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default Hero;
