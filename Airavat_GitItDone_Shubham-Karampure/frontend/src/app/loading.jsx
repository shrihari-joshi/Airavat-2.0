"use client";

import React from "react";

const Loader = () => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
      <div className="relative w-24 h-24">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 w-2 h-10 bg-blue-500 origin-bottom animate-spinner"
            style={{
              transform: `rotate(${i * 36}deg) translateY(-50%)`,
              animationDelay: `${i * 0.1}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Loader;
