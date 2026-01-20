import React from 'react';
import Hero from './Landing/Hero';
import Features from './Landing/Features';
import Categories from './Landing/Categories';
// import StatsGrid from './Landing/StatsGrid';


const LandingPage = () => {
    return (
        <div className="w-full bg-white pb-20 md:pb-0">
            <Hero />
            <Categories />

            <Features />
        </div>
    );
};

export default LandingPage;
