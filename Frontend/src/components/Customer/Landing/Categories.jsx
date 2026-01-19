import React, { useState, useEffect, useMemo, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronLeft, ChevronRight } from "lucide-react"
import API from "../../../../api"

const Categories = () => {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [index, setIndex] = useState(0)
    const [visibleCards, setVisibleCards] = useState(1)
    const [cardWidth, setCardWidth] = useState(280)
    const [gap, setGap] = useState(24)

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
            let calculatedCardWidth = 280
            let calculatedGap = 24
            let padding = 0

            if (width < 640) {
                calculatedCardWidth = 260
                calculatedGap = 16
                padding = 32
            } else if (width < 768) {
                calculatedCardWidth = 270
                calculatedGap = 20
                padding = 48
            } else if (width < 1024) {
                calculatedCardWidth = 280
                calculatedGap = 20
                padding = 96
            } else {
                calculatedCardWidth = 280
                calculatedGap = 24
                padding = 112
            }

            padding += 48
            const availableWidth = width - padding
            const cards = Math.floor(availableWidth / (calculatedCardWidth + calculatedGap))

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

    const prev = useCallback(() => {
        setIndex(prev => Math.max(0, prev - 1))
    }, [])

    const next = useCallback(() => {
        setIndex(prev => Math.min(Math.max(0, categories.length - visibleCards), prev + 1))
    }, [categories.length, visibleCards])

    const handleCategoryClick = useCallback((slug) => {
        navigate(`/category/${slug}`)
    }, [navigate])

    const handleDotClick = useCallback((i) => {
        setIndex(i)
    }, [])

    const isAtStart = index === 0
    const isAtEnd = index >= categories.length - visibleCards
    const totalSlides = Math.ceil(categories.length / visibleCards)

    return (
        <section className="w-full py-8 sm:py-12 md:py-16 px-4 sm:px-6 md:pl-12 md:pr-16">
            <div className="max-w-8xl mx-auto px-2 sm:px-4 md:px-6">
                <div className="mb-6 sm:mb-8 md:mb-10">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">
                        Shop by Category
                    </h2>
                    <p className="text-sm sm:text-base text-gray-500 font-medium italic">
                        Premium Beauty & Skincare Essentials
                    </p>
                </div>

                <div className="relative">
                    {!isAtStart && (
                        <button
                            onClick={prev}
                            className="hidden md:flex absolute -left-4 lg:-left-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all border border-gray-200"
                            aria-label="Previous categories"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-700" />
                        </button>
                    )}

                    <div
                        className="w-full overflow-x-auto md:overflow-hidden scrollbar-hide scroll-smooth snap-x snap-mandatory"
                        style={{
                            WebkitOverflowScrolling: 'touch',
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none'
                        }}
                    >
                        {loading ? (
                            <div className="flex gap-4 md:gap-5 lg:gap-6">
                                {[...Array(visibleCards + 1)].map((_, i) => (
                                    <div key={i} className="flex-shrink-0 w-[260px] sm:w-[270px] md:w-[280px] h-64 bg-slate-100 rounded-2xl animate-pulse" style={{ minWidth: `${cardWidth}px` }}></div>
                                ))}
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="py-12 text-center w-full">
                                <p className="text-gray-400 font-medium italic">No categories available at the moment.</p>
                            </div>
                        ) : (
                            <div
                                className="flex gap-4 md:gap-5 lg:gap-6 transition-transform duration-500 ease-in-out md:transition-transform pb-2 md:pb-0"
                                style={{
                                    transform: window.innerWidth >= 768 ? `translateX(-${index * (cardWidth + gap)}px)` : 'none',
                                    willChange: 'transform'
                                }}
                            >
                                {categories.map((cat, i) => (
                                    <div
                                        key={cat._id}
                                        onClick={() => handleCategoryClick(cat.name.toLowerCase().replace(/\s+/g, '-'))}
                                        className="flex-shrink-0 w-[260px] sm:w-[270px] md:w-[280px] bg-white border border-slate-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden cursor-pointer group snap-start"
                                        style={{ minWidth: `${cardWidth}px` }}
                                    >
                                        <div className="h-40 sm:h-44 md:h-48 w-full overflow-hidden bg-slate-50">
                                            {cat.icon ? (
                                                <img
                                                    src={cat.icon}
                                                    alt={cat.name}
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                    <span className="text-xs font-black uppercase tracking-widest">{cat.name.charAt(0)}</span>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-5">
                                            <h3 className="text-[17px] font-bold text-gray-900 mb-4 line-clamp-1 group-hover:text-orange-600 transition-colors uppercase tracking-tight">
                                                {cat.name}
                                            </h3>
                                            <button className="w-full px-4 py-2.5 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white text-xs sm:text-[13px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_4px_12px_rgba(249,115,22,0.2)] hover:shadow-[0_8px_20px_rgba(249,115,22,0.3)]">
                                                Explore
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {!isAtEnd && (
                        <button
                            onClick={next}
                            className="hidden md:flex absolute -right-4 lg:-right-6 top-1/2 -translate-y-1/2 z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white shadow-lg items-center justify-center hover:bg-gray-50 hover:shadow-xl transition-all border border-gray-200"
                            aria-label="Next categories"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-700" />
                        </button>
                    )}
                </div>

                <div className="md:hidden flex justify-center items-center gap-2 mt-4 text-xs text-gray-500">
                    <ChevronLeft className="w-3 h-3" />
                    <span>Swipe to explore more</span>
                    <ChevronRight className="w-3 h-3" />
                </div>

                <div className="hidden md:flex justify-center items-center gap-2 mt-6">
                    {Array.from({ length: totalSlides }).map((_, i) => (
                        <button
                            key={i}
                            onClick={() => handleDotClick(i)}
                            className={`h-2 rounded-full transition-all ${i === index
                                ? 'w-8 bg-orange-500'
                                : 'w-2 bg-gray-300 hover:bg-gray-400'
                                }`}
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
            `}</style>
        </section>
    )
}

export default Categories
