import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FaInfinity,
    FaShoppingBag,
    FaCog,
    FaHome,
    FaFilter,
    FaChevronDown,
    FaChevronUp
} from 'react-icons/fa';
import { BsFillBagHeartFill } from 'react-icons/bs';

const Sidebar = ({ showFilters = false, onFiltersChange, categories = [], maxPrice = 50000 }) => {
    const navigate = useNavigate();

    // Filter states
    const [sortBy, setSortBy] = useState('relevance');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [priceRange, setPriceRange] = useState([0, maxPrice]);
    const [expandedSections, setExpandedSections] = useState({
        sortBy: true,
        categories: true,
        priceRange: true
    });

    // Update price range when maxPrice changes
    useEffect(() => {
        setPriceRange([0, maxPrice]);
    }, [maxPrice]);

    // Notify parent of filter changes
    useEffect(() => {
        if (showFilters && onFiltersChange) {
            onFiltersChange({
                sortBy,
                categories: selectedCategories,
                priceRange
            });
        }
    }, [sortBy, selectedCategories, priceRange, showFilters, onFiltersChange]);


    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleCategoryToggle = (category) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const clearAllFilters = () => {
        setSortBy('relevance');
        setSelectedCategories([]);
        setPriceRange([0, maxPrice]);
    };

    // Render filter sidebar
    if (showFilters) {
        return (
            <div className="hidden md:block w-72 bg-white border-r border-gray-200 h-[calc(100vh-80px)] overflow-y-auto sticky top-20">
                <div className="p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <FaFilter className="w-5 h-5 text-primary" />
                            <h2 className="text-xl font-bold text-gray-800">Filters</h2>
                        </div>
                        <button
                            onClick={clearAllFilters}
                            className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                        >
                            Clear All
                        </button>
                    </div>

                    {/* Sort By Section */}
                    <div className="mb-6">
                        <button
                            onClick={() => toggleSection('sortBy')}
                            className="w-full flex items-center justify-between py-3 border-b border-gray-200"
                        >
                            <h3 className="text-base font-bold text-gray-800">Sort By</h3>
                            {expandedSections.sortBy ? (
                                <FaChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                                <FaChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                        </button>
                        {expandedSections.sortBy && (
                            <div className="mt-4 space-y-3">
                                {[
                                    { value: 'relevance', label: 'Relevance' },
                                    { value: 'newest', label: 'New Arrivals' },
                                    { value: 'price-low', label: 'Price: Low to High' },
                                    { value: 'price-high', label: 'Price: High to Low' },
                                    { value: 'rating', label: 'Rating' }
                                ].map((option) => (
                                    <label key={option.value} className="flex items-center gap-3 cursor-pointer group">
                                        <input
                                            type="radio"
                                            name="sortBy"
                                            value={option.value}
                                            checked={sortBy === option.value}
                                            onChange={(e) => setSortBy(e.target.value)}
                                            className="w-5 h-5 text-primary border-gray-300 focus:ring-primary"
                                        />
                                        <span className={`text-sm ${sortBy === option.value ? 'text-primary font-semibold' : 'text-gray-700 group-hover:text-gray-900'}`}>
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Categories Section */}
                    {categories && categories.length > 0 && (
                        <div className="mb-6">
                            <button
                                onClick={() => toggleSection('categories')}
                                className="w-full flex items-center justify-between py-3 border-b border-gray-200"
                            >
                                <h3 className="text-base font-bold text-gray-800">Categories</h3>
                                {expandedSections.categories ? (
                                    <FaChevronUp className="w-4 h-4 text-gray-500" />
                                ) : (
                                    <FaChevronDown className="w-4 h-4 text-gray-500" />
                                )}
                            </button>
                            {expandedSections.categories && (
                                <div className="mt-4 space-y-3">
                                    {categories.map((category) => (
                                        <label key={category.name} className="flex items-center justify-between cursor-pointer group">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(category.name)}
                                                    onChange={() => handleCategoryToggle(category.name)}
                                                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                                                />
                                                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                                    {category.name}
                                                </span>
                                            </div>
                                            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                                                {category.count || 0}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Price Range Section */}
                    <div className="mb-6">
                        <button
                            onClick={() => toggleSection('priceRange')}
                            className="w-full flex items-center justify-between py-3 border-b border-gray-200"
                        >
                            <h3 className="text-base font-bold text-gray-800">Price Range</h3>
                            {expandedSections.priceRange ? (
                                <FaChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                                <FaChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                        </button>
                        {expandedSections.priceRange && (
                            <div className="mt-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 font-medium mb-1">MIN</p>
                                        <p className="text-sm font-bold text-gray-800">₹{priceRange[0]}</p>
                                    </div>
                                    <div className="w-8 h-px bg-gray-300"></div>
                                    <div className="text-center">
                                        <p className="text-xs text-gray-500 font-medium mb-1">MAX</p>
                                        <p className="text-sm font-bold text-gray-800">₹{priceRange[1]}</p>
                                    </div>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max={maxPrice}
                                    step="100"
                                    value={priceRange[1]}
                                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    style={{
                                        background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${(priceRange[1] / maxPrice) * 100}%, #e5e7eb ${(priceRange[1] / maxPrice) * 100}%, #e5e7eb 100%)`
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Render navigation sidebar (Horizontal Menu Bar)
    return (
        <>
            <div className="hidden md:flex w-full h-16 bg-white border-b border-gray-200 fixed top-[60px] left-0 right-0 z-40 items-center justify-center gap-8 shadow-sm">

                {/* Navigation Icons - Horizontal */}
                <div className="flex items-center gap-8">
                    {/* Home */}
                    <button
                        onClick={() => navigate('/')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100/80 transition-all duration-300 group"
                    >
                        <FaHome className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                        <span className="font-medium text-gray-700 group-hover:text-primary">Home</span>
                    </button>

                    {/* Cart */}
                    <button
                        onClick={() => navigate('/Cart')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100/80 transition-all duration-300 group"
                    >
                        <FaShoppingBag className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                        <span className="font-medium text-gray-700 group-hover:text-primary">Cart</span>
                    </button>

                    {/* Wishlist */}
                    <button
                        onClick={() => navigate('/Wishlist')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100/80 transition-all duration-300 group"
                    >
                        <BsFillBagHeartFill className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                        <span className="font-medium text-gray-700 group-hover:text-primary">Wishlist</span>
                    </button>

                    {/* Settings */}
                    <button
                        onClick={() => navigate('/Settings')}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100/80 transition-all duration-300 group"
                    >
                        <FaCog className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                        <span className="font-medium text-gray-700 group-hover:text-primary">Settings</span>
                    </button>
                </div>
            </div>

            {/* Mobile Bottom Navigation - Desktop Style */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
                <div className="flex items-center justify-around px-2 py-2">
                    {/* Home */}
                    <div className="relative group">
                        <button
                            onClick={() => navigate('/')}
                            className="w-12 h-12 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all duration-300 cursor-pointer active:scale-95"
                        >
                            <FaHome className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
                        </button>
                    </div>

                    {/* Cart */}
                    <div className="relative group">
                        <button
                            onClick={() => navigate('/Cart')}
                            className="w-12 h-12 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all duration-300 cursor-pointer active:scale-95"
                        >
                            <FaShoppingBag className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
                        </button>
                    </div>

                    {/* Wishlist */}
                    <div className="relative group">
                        <button
                            onClick={() => navigate('/Wishlist')}
                            className="w-12 h-12 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all duration-300 cursor-pointer active:scale-95"
                        >
                            <BsFillBagHeartFill className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
                        </button>
                    </div>

                    {/* Settings */}
                    <div className="relative group">
                        <button
                            onClick={() => navigate('/Settings')}
                            className="w-12 h-12 bg-white border-2 border-gray-100 rounded-xl flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all duration-300 cursor-pointer active:scale-95"
                        >
                            <FaCog className="w-5 h-5 text-gray-700 group-hover:text-primary transition-colors" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
