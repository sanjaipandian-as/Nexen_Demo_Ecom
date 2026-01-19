import React from 'react';
import Hero from './Landing/Hero';
import Features from './Landing/Features';
import Categories from './Landing/Categories';
import SpecialOffers from './Landing/SpecialOffers';
import FestiveOffers from './Landing/FestiveOffers';
import StatsGrid from './Landing/StatsGrid';

const LandingPage = () => {
    return (
        <div className="w-full bg-gray-50 pb-20 md:pb-0">
            <Hero />
            <Features />
            <Categories />
            <SpecialOffers />
            <FestiveOffers />
            <StatsGrid />
        </div>
    );
};

export default LandingPage;
