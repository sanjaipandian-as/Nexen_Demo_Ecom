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
        <div className="flex flex-col w-full min-h-screen bg-gray-50">
            <Searchbar />
            <Sidebar />

            {/* Main Content - Padding top equal to Sidebar height (64px) as Searchbar acts as Topbar in flow */}
            <div className="flex-1 w-full pt-16">
                <LandingPage />
                <Products filters={filters} />
                <Footer />
            </div>
        </div>
    );
};

export default Homepage;
