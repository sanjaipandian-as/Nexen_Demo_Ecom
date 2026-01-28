import React, { useState, useEffect, useMemo, useCallback, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react"
import API from "../../../../api"

const Categories = () => {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [index, setIndex] = useState(0)
    const [visibleCards, setVisibleCards] = useState(1)
    const [cardWidth, setCardWidth] = useState(280)
    const [gap, setGap] = useState(24)
    const scrollRef = useRef(null)

    const categorySublabels = useMemo(() => ({
        'skincare': 'radiate confidence',
        'makeup': 'express your essence',
        'haircare': 'nourish every strand',
        'fragrance': 'find your signature',
        'wellness': 'inner glow, outer beauty',
        'bath & body': 'ultimate self-care ritual',
        'tools & brushes': 'precision in every stroke',
        'men': 'refined grooming essentials'
    }), [])

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setLoading(true)
                const response = await API.get('/categories')
                setCategories(response.data)
            } catch (error) {
                console.error('Error fetching categories:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchCategories()
    }, [])

    useEffect(() => {
        const calculateLayout = () => {
            const width = window.innerWidth
            const maxWidth = 1440 // max-w-8xl estimate
            const effectiveWidth = Math.min(width, maxWidth)

            let calculatedCardWidth = 320
            let calculatedGap = 32 // matching gap-8
            let totalPadding = 120 // lg:px-12 (96) + md:px-2 (16) + buffer

            if (width < 640) {
                calculatedCardWidth = 200
                calculatedGap = 16
                totalPadding = 48 // px-4 (32) + buffer
            } else if (width < 768) {
                calculatedCardWidth = 240
                calculatedGap = 16
                totalPadding = 80 // sm:px-8 (64) + buffer
            } else if (width < 1024) {
                calculatedCardWidth = 280
                calculatedGap = 24
                totalPadding = 96 // sm:px-8 (64) + md:px-2 (16) + buffer
            }

            const availableWidth = effectiveWidth - totalPadding
            const cards = Math.floor((availableWidth + calculatedGap) / (calculatedCardWidth + calculatedGap))

            setCardWidth(calculatedCardWidth)
            setGap(calculatedGap)
            setVisibleCards(Math.max(1, cards))
        }

        let timeoutId
        const debouncedCalculate = () => {
            clearTimeout(timeoutId)
            timeoutId = setTimeout(calculateLayout, 150)
        }

        calculateLayout()
        window.addEventListener('resize', debouncedCalculate)
        return () => {
            clearTimeout(timeoutId)
            window.removeEventListener('resize', debouncedCalculate)
        }
    }, [])


    const handleCategoryClick = useCallback((slug) => {
        navigate(`/category/${slug}`)
    }, [navigate])

    const handleDotClick = useCallback((i) => {
        setIndex(i)
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                left: i * (cardWidth + gap),
                behavior: 'smooth'
            })
        }
    }, [cardWidth, gap])

    useEffect(() => {
        const handleScroll = () => {
            if (scrollRef.current) {
                const scrollPosition = scrollRef.current.scrollLeft
                const newIndex = Math.round(scrollPosition / (cardWidth + gap))
                if (newIndex !== index) {
                    setIndex(newIndex)
                }
            }
        }

        const container = scrollRef.current
        if (container) {
            container.addEventListener('scroll', handleScroll)
            return () => container.removeEventListener('scroll', handleScroll)
        }
    }, [index, cardWidth, gap])

    const totalSlides = Math.ceil(categories.length / visibleCards)

    return (
        <section className="w-full py-9 sm:py-16 md:py-24 px-0 overflow-hidden" style={{ background: '#FFFDFD' }}>
            <div className="max-w-8xl mx-auto px-4 sm:px-8 lg:px-12">
                <div className="flex flex-col items-center text-center mb-10 sm:mb-14 md:mb-16">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 tracking-tight" style={{ color: '#2E2E2E' }}>
                        Curated <span style={{ color: '#E91E63' }}>Collections</span>
                    </h2>
                    <div className="w-20 h-1 rounded-full mb-4" style={{ backgroundColor: '#F8BBD0' }}></div>
                    <p className="text-sm sm:text-lg text-gray-500 font-medium max-w-2xl px-4">
                        Discover premium beauty & skincare essentials designed to enhance your natural radiance and confidence.
                    </p>
                </div>

                <div className="relative px-0 md:px-2">

                    <div
                        ref={scrollRef}
                        className="w-full overflow-x-auto scrollbar-hide scroll-smooth snap-x snap-mandatory"
                        style={{
                            WebkitOverflowScrolling: 'touch',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}
                    >
                        {loading ? (
                            <div className="flex gap-4 md:gap-6 lg:gap-8">
                                {[...Array(visibleCards + 1)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="flex-shrink-0 rounded-[24px] animate-pulse"
                                        style={{
                                            minWidth: `${cardWidth}px`,
                                            height: '300px',
                                            backgroundColor: '#FCE4EC'
                                        }}
                                    ></div>
                                ))}
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="py-20 text-center w-full">
                                <p className="text-gray-400 font-medium italic text-lg">Our beauty vault is currently empty. Check back soon!</p>
                            </div>
                        ) : (
                            <div
                                className="flex justify-center gap-4 md:gap-6 lg:gap-8 pb-4 md:pb-0"
                                style={{
                                    justifyContent: categories.length <= visibleCards ? 'center' : 'flex-start'
                                }}
                            >
                                {categories.map((cat, i) => (
                                    <div
                                        key={cat._id}
                                        onClick={() => handleCategoryClick(cat.name.toLowerCase().replace(/\s+/g, '-'))}
                                        className="flex-shrink-0 bg-white border-2 rounded-[24px] transition-all duration-300 overflow-hidden cursor-pointer group snap-start relative shadow-sm hover:shadow-2xl hover:-translate-y-2 flex flex-col"
                                        style={{
                                            minWidth: `${cardWidth}px`,
                                            width: `${cardWidth}px`,
                                            height: '550px',
                                            background: 'linear-gradient(135deg, #FFF5F7 0%, #FFFFFF 100%)',
                                            borderColor: '#FCE4EC'
                                        }}
                                    >
                                        <div className="w-full overflow-hidden bg-[#FDF2F5] relative flex-shrink-0" style={{ height: '320px' }}>
                                            {cat.icon ? (
                                                <img
                                                    src={cat.icon}
                                                    alt={cat.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[#F8BBD0]">
                                                    <span className="text-4xl font-black uppercase tracking-widest">{cat.name.charAt(0)}</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300"></div>
                                        </div>

                                        <div className="p-6 flex flex-col items-center text-center flex-1 justify-between">
                                            <div className="w-full">
                                                <div className="mb-1">
                                                    <h3 className="text-base sm:text-lg font-bold mb-1 transition-all duration-300 group-hover:text-[#E91E63] line-clamp-1" style={{ color: '#2E2E2E' }}>
                                                        {cat.name}
                                                    </h3>
                                                    <div className="h-0.5 w-0 group-hover:w-full transition-all duration-500 bg-[#E91E63] mx-auto"></div>
                                                </div>

                                                <p className="text-[10px] sm:text-xs text-gray-500 italic mb-4 font-medium tracking-wide line-clamp-2">
                                                    {categorySublabels[cat.name.toLowerCase()] || 'unveil your radiance'}
                                                </p>
                                            </div>

                                            <button className="flex items-center gap-2 px-4 sm:px-6 py-2 bg-transparent border-2 border-[#F8BBD0] text-[#E91E63] rounded-full transition-all duration-300 font-bold text-[10px] sm:text-xs uppercase tracking-widest group-hover:bg-[#E91E63] group-hover:text-white group-hover:border-[#E91E63] mt-auto">
                                                <span>Explore Now</span>
                                                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                <div className="md:hidden flex justify-center items-center gap-2 mt-6 text-sm font-medium" style={{ color: '#E91E63' }}>
                    <ChevronLeft className="w-4 h-4 animate-pulse" />
                    <span className="uppercase tracking-widest text-[10px]">Swipe to discover more</span>
                    <ChevronRight className="w-4 h-4 animate-pulse" />
                </div>

                <div className="hidden md:flex justify-center items-center gap-3 mt-10">
                    {Array.from({ length: totalSlides }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => handleDotClick(i * visibleCards)}
                            className={`transition-all duration-500 ${i === Math.floor(index / visibleCards)
                                ? 'w-10 h-2'
                                : 'w-3 h-2 hover:bg-[#F8BBD0]'
                                } rounded-full`}
                            style={{ backgroundColor: i === Math.floor(index / visibleCards) ? '#E91E63' : '#E5E7EB' }}
                            aria-label={`Go to slide ${i + 1}`}
                        />
                    ))}
                </div>
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
                @keyframes sparkle {
                    0%, 100% { transform: scale(1); }
                    50% { transform: scale(1.05); }
                }
                .animate-sparkle {
                    animation: sparkle 2s infinite ease-in-out;
                }
            `}</style>
        </section>
    )
}

export default Categories
