import React from 'react';

const Skeleton = ({ className = '', variant = 'rect', ...props }) => {
    const baseClass = 'animate-pulse bg-gray-200';
    const variantClass = variant === 'circle' ? 'rounded-full' : 'rounded-lg';

    return (
        <div
            className={`${baseClass} ${variantClass} ${className}`}
            {...props}
        />
    );
};

export default Skeleton;
