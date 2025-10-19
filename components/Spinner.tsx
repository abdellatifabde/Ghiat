
import React from 'react';

export const Spinner: React.FC = () => (
  <div className="flex justify-center items-center py-10">
    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-teal-600"></div>
  </div>
);
