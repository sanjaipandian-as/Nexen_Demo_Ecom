import { useState } from 'react';
import Sidebar from '../components/Customer/Sidebar';
import Products from '../components/Customer/Products';
import Searchbar from '../components/Customer/Topbar';
import Settings from './Settings';
import LandingPage from '../components/Customer/LandingPage';
import Footer from '../components/Customer/Footer';

const Homepage = () => {
    const [filters, setFilters] = useState({
        sortBy: 'relevance',
        category: '',
        priceRange: [0, 50000]
    });

    const handleFiltersChange = (newFilters) => {
        setFilters(newFilters);
    };

    return (
        <div className="flex w-full h-screen bg-gray-50">
            <Sidebar />
            <div className="flex flex-col flex-1 h-screen overflow-y-auto">
                <Searchbar />
                <LandingPage />
                <Products filters={filters} />
                <Footer />
            </div>
        </div>
    );
};

export default Homepage;
