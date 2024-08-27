import React from 'react';
import SkeletonCard from './SkeletonLoading'; // Use the skeleton card component

const Loading = () => {
  return (
    <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  );
};

export default Loading;
