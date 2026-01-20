import React from 'react';
import Hero from './Landing/Hero';
import Categories from './Landing/Categories';
// import StatsGrid from './Landing/StatsGrid';


const LandingPage = () => {
    return (
        <div className="w-full bg-white pb-20 md:pb-0">
            <Hero />
            <Categories />

        </div>
    );
};

export default LandingPage;
