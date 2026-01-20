import React from 'react';
import { useNavigate } from 'react-router-dom';

const StatsGrid = () => {
    const navigate = useNavigate();

    const scrollToProducts = () => {
        const productsSection = document.getElementById('products-section');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <h2 className="text-3xl md:text-5xl font-black text-center mb-10 tracking-tight text-gray-900">
                CURATED COLLECTIONS
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 h-auto lg:h-[600px]">
                {/* Large Featured Card */}
                <div className="lg:col-span-6 relative group overflow-hidden rounded-2xl cursor-pointer h-[400px] lg:h-full" onClick={scrollToProducts}>
                    <img
                        src="https://images.unsplash.com/photo-1520975661595-6453be3f7070?q=80&w=1974&auto=format&fit=crop"
                        alt="The Pink Edit"
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-8">
                        <p className="text-secondary font-bold tracking-widest uppercase mb-2">Editor's Pick</p>
                        <h3 className="text-4xl font-black text-white mb-4">THE PINK EDIT</h3>
                        <button className="w-fit bg-white text-black px-6 py-2 rounded-full font-bold uppercase text-sm hover:bg-primary hover:text-white transition-colors">
                            Shop Now
                        </button>
                    </div>
                </div>

                {/* Right Column Grid */}
                <div className="lg:col-span-6 grid grid-cols-2 gap-4 h-full">
                    <div className="col-span-2 h-[200px] lg:h-[290px] relative group overflow-hidden rounded-2xl cursor-pointer" onClick={scrollToProducts}>
                        <img
                            src="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop"
                            alt="Winter Coats"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 p-6">
                            <h3 className="text-2xl font-bold text-white drop-shadow-md">WINTER COATS</h3>
                        </div>
                    </div>

                    <div className="h-[200px] lg:h-[290px] relative group overflow-hidden rounded-2xl cursor-pointer" onClick={scrollToProducts}>
                        <img
                            src="https://images.unsplash.com/photo-1511556820780-dba8ba36b745?q=80&w=1974&auto=format&fit=crop"
                            alt="Accessories"
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                        <div className="absolute bottom-0 left-0 p-6">
                            <h3 className="text-xl font-bold text-white drop-shadow-md">ACCESSORIES</h3>
                        </div>
                    </div>

                    <div className="bg-[#F7DB91] rounded-2xl p-6 flex flex-col justify-center items-center text-center cursor-pointer hover:bg-[#ffe39f] transition-colors h-[200px] lg:h-[290px]" onClick={scrollToProducts}>
                        <p className="font-bold text-gray-800 text-lg mb-2">FLAT</p>
                        <h3 className="text-6xl font-black text-white drop-shadow-sm mb-2">50%</h3>
                        <p className="font-black text-2xl text-gray-800 uppercase">OFF</p>
                        <p className="text-sm font-medium mt-2">On Selected Items</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsGrid;
