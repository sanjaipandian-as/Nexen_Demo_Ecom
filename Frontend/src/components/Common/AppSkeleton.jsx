import React from 'react';
import Skeleton from './Skeleton';

const AppSkeleton = () => {
    return (
        <div className="w-full min-h-screen bg-gray-50">
            {/* Topbar Skeleton */}
            <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 md:px-6 py-3">
                <div className="flex items-center justify-between gap-6">
                    {/* Logo */}
                    <Skeleton className="h-8 w-32 md:w-48" />

                    {/* Search Bar */}
                    <div className="hidden md:flex flex-1 max-w-2xl">
                        <Skeleton className="h-12 w-full rounted-full rounded-[9999px]" />
                    </div>

                    {/* Icons */}
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-full" variant="circle" />
                        <div className="hidden md:flex gap-3">
                            <Skeleton className="h-10 w-24 rounded-full" />
                            <Skeleton className="h-10 w-24 rounded-full" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Bar Skeleton */}
            <div className="hidden md:flex w-full h-16 bg-white border-b border-gray-200 items-center justify-center gap-8 mb-1">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
            </div>

            {/* Main Content */}
            <div className="w-full">
                {/* Hero Skeleton */}
                <div className="relative h-[65vh] sm:h-[75vh] md:h-[85vh] w-full bg-gray-200 animate-pulse">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="space-y-4 max-w-2xl w-full px-6">
                            <div className="h-4 bg-gray-300 w-32 mx-auto rounded"></div>
                            <div className="h-16 bg-gray-300 w-3/4 mx-auto rounded"></div>
                            <div className="h-6 bg-gray-300 w-1/2 mx-auto rounded"></div>
                        </div>
                    </div>
                </div>

                {/* Categories Skeleton */}
                <div className="py-16 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-10">
                            <Skeleton className="h-10 w-64 mb-2" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                        <div className="flex gap-6 overflow-hidden">
                            {[...Array(5)].map((_, i) => (
                                <Skeleton key={i} className="w-[280px] h-64 rounded-2xl flex-shrink-0" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppSkeleton;
