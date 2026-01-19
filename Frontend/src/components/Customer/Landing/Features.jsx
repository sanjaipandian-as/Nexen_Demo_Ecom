import React from 'react';
import { FaTruck, FaShieldAlt, FaPercent } from 'react-icons/fa';

const Features = () => {
    return (
        <div className="border-y border-gray-200 py-4 sm:py-6 md:py-8">
            <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                    <div className="flex items-center gap-2 sm:gap-3 justify-center p-2 sm:p-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                            <FaTruck className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base">Free Delivery</p>
                            <p className="text-[10px] sm:text-xs text-gray-600">Orders above ₹999</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 justify-center p-2 sm:p-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                            <FaShieldAlt className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base">100% Safe</p>
                            <p className="text-[10px] sm:text-xs text-gray-600">Certified Products</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 justify-center p-2 sm:p-0">
                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                            <FaPercent className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-xs sm:text-sm md:text-base">Best Prices</p>
                            <p className="text-[10px] sm:text-xs text-gray-600">Guaranteed Lowest</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Features;
