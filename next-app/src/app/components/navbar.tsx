'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  return (
    <nav className="bg-[#FFF5EB] shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo + Brand */}
        <div className="flex items-center space-x-3">
          <Image src="/logo.svg" alt="Logo" width={36} height={36} />
          <span className="text-2xl font-bold text-[#014D4E] tracking-tight">Reflectly.AI</span>
        </div>

        {/* Navigation Links */}
        <div className="flex space-x-6 text-[#014D4E] font-medium text-base">
          <Link href="/dashboard" className="hover:text-black transition-colors duration-200">Dashboard</Link>
          <Link href="/dashboard/ai-companion" className="hover:text-black transition-colors duration-200">AI Companion</Link>
          <Link href="/dashboard/journal" className="hover:text-black transition-colors duration-200">Journal</Link>
          <Link href="/dashboard/self-care" className="hover:text-black transition-colors duration-200">Self Care</Link>
          <Link href="/dashboard/therapist" className="hover:text-black transition-colors duration-200">Book A Therapist</Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
