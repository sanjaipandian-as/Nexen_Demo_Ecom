import React from 'react';

const StatsGrid = () => {
    return (
        <div className="container mx-auto px-3 sm:px-2 md:px-2 lg:px-2 py-6 md:py-12 bg-gray-50">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Top Ranking */}
                <div className="bg-white rounded-2xl p-5 shadow-sm h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">Top ranking</h3>
                        <span className="text-sm text-orange-500 font-semibold cursor-pointer hover:text-orange-600 transition-colors">View more</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">Hot selling · Traditional Clothing & Accessories</p>
                    <div className="rounded-xl overflow-hidden mb-4 flex-grow">
                        <img
                            src="https://images.unsplash.com/photo-1574380965762-d7af37362e0c?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8ZGl3YWxpJTIwY3JhY2tlcnN8ZW58MHx8MHx8fDA%3D"
                            alt="Top Ranking"
                            className="w-full h-64 lg:h-72 object-cover"
                            onError={(e) => {
                                e.target.src = '/Monkey.jpg';
                                e.target.onerror = null;
                            }}
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-2 mt-auto">
                        <img src="https://images.unsplash.com/photo-1700623066384-555c048e50e2?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8ZGl3YWxpJTIwY3JhY2tlcnN8ZW58MHx8MHx8fDA%3D" className="rounded-lg h-20 w-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }} />
                        <img src="https://images.unsplash.com/photo-1572098688575-0db28b6a165b?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fGRpd2FsaSUyMGNyYWNrZXJzfGVufDB8fDB8fHww" className="rounded-lg h-20 w-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }} />
                        <img src="https://media.istockphoto.com/id/645713294/photo/fireworks.jpg?s=612x612&w=0&k=20&c=Fh-AGfLgSjIwzlDipGogSbdsKrKU5PxOCCh0plXE-N0=" className="rounded-lg h-20 w-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }} />
                    </div>
                </div>

                {/* New Arrivals */}
                <div className="bg-white rounded-2xl p-5 shadow-sm h-full flex flex-col hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-gray-900">New arrivals</h3>
                        <span className="text-sm text-orange-500 font-semibold cursor-pointer hover:text-orange-600 transition-colors">View more</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">134,000+ products added today</p>
                    <div className="grid grid-cols-2 gap-3 mb-4 flex-grow">
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4kCjRBzhwKsmcfxSe_y-7CyJhUIXz-j7nig&s" alt="" className="rounded-lg h-40 w-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }} />
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ4kCjRBzhwKsmcfxSe_y-7CyJhUIXz-j7nig&s" className="rounded-lg h-40 w-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }} />
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQj1vkyLax_Tr063fVse4zuoykOG-w86WVMnw&s" className="rounded-lg h-40 w-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }} />
                        <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfYkrOzFi6JPsdACNsJeGhB2oMTjZjJJmarBL_wEEqAw&s" className="rounded-lg h-40 w-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onError={(e) => { e.target.src = '/Monkey.jpg'; e.target.onerror = null; }} />
                    </div>
                    <div className="mt-auto text-sm font-semibold text-gray-800">
                        New this week
                        <span className="block text-xs text-gray-500 font-normal">Products from verified suppliers only</span>
                    </div>
                </div>

                {/* Top Deals & Best Sellers */}
                <div className="space-y-6">
                    <div className="bg-white rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:shadow-lg transition-shadow cursor-pointer">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSfYkrOzFi6JPsdACNsJeGhB2oMTjZjJJmarBL_wEEqAw&s"
                            className="w-20 h-20 object-cover rounded-xl"
                            alt="Top Deals"
                            onError={(e) => {
                                e.target.src = '/Monkey.jpg';
                                e.target.onerror = null;
                            }}
                        />
                        <div>
                            <p className="text-lg font-bold text-gray-900">Top deals</p>
                            <p className="text-sm text-gray-600">180-day lowest price</p>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-shadow cursor-pointer">
                        <p className="text-lg font-bold text-gray-900 mb-4">Deals on best sellers</p>
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0s-JN8VBDNJPykkWNWv_dgxGn08u-hmP9Ag&s"
                            alt="Best Sellers"
                            className="rounded-lg h-80 w-full object-cover"
                            onError={(e) => {
                                e.target.src = '/Monkey.jpg';
                                e.target.onerror = null;
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StatsGrid;
