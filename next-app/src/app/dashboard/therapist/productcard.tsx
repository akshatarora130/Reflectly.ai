'use client';

import React from 'react';

interface ProductCardProps {
    name: string;
  title: string;
  description: string;
  image: string;
  price: string;
  oldPrice?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({
  name,
  title,
  description,
  image,
  price,
  oldPrice,
}) => {
  return (
    <a href="#" className="group relative block overflow-hidden rounded-xl shadow-md">
      {/* Wishlist Button */}
      <button className="absolute end-4 top-4 z-10 rounded-full bg-white p-1.5 text-gray-900 transition hover:text-gray-900/75">
        <span className="sr-only">Wishlist</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-4"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      </button>

      {/* Product Image */}
      <img
        src={image}
        alt={title}
        className="h-72 w-full object-cover transition duration-500 group-hover:scale-105"
      />

      {/* Content */}
      <div className="relative border border-gray-100 bg-white p-6">
        <p className="text-gray-700">
          {price}
        </p>
        <h3 className="mt-1.5 text-lg font-medium text-gray-900">{name}</h3>
        <h3 className="mt-1.5 text-lg font-medium text-gray-900">{title}</h3>

        <p className="mt-1.5 line-clamp-3 text-gray-700">{description}</p>

        {/* Single Action Button */}
        <div className="mt-4">
          <button
            type="button"
            className="block w-full rounded-sm bg-green-900 px-4 py-3 text-sm font-medium text-white transition hover:scale-105"
          >
            Consult Now
          </button>
        </div>
      </div>
    </a>
  );
};

export default ProductCard;
