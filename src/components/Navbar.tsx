'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavbarProps {
  onSearchClick: () => void;
}

const Navbar = ({ onSearchClick }: NavbarProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'TV Shows', href: '/tv' },
    { name: 'Movies', href: '/movies' },
    { name: 'New & Popular', href: '/new' },
    { name: 'My List', href: '/watchlist' },
  ];

  return (
    <nav 
      className={`fixed top-0 z-50 w-full px-4 py-3 transition-all duration-500 lg:px-12 ${
        isScrolled ? 'bg-[#141414] shadow-md' : 'bg-gradient-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 lg:gap-10">
          <Link href="/" className="flex items-center transition-transform hover:scale-105 active:scale-95">
            <svg viewBox="0 0 500 500" className="h-8 w-auto lg:h-16" aria-label="Netflix Clone">
              <defs>
                <linearGradient id="leftLeg" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ff0a16" />
                  <stop offset="50%" stopColor="#e50914" />
                  <stop offset="100%" stopColor="#b20710" />
                </linearGradient>

                <linearGradient id="rightLeg" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#110000" />
                  <stop offset="30%" stopColor="#7a050d" />
                  <stop offset="70%" stopColor="#e50914" />
                  <stop offset="100%" stopColor="#ff0a16" />
                </linearGradient>

                <linearGradient id="crossBar" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#110000" />
                  <stop offset="50%" stopColor="#8a040b" />
                  <stop offset="100%" stopColor="#110000" />
                </linearGradient>

                <clipPath id="netflix-curve">
                  <path d="M 0 0 L 500 0 L 500 480 Q 250 390 0 480 Z" />
                </clipPath>
              </defs>

              <g clipPath="url(#netflix-curve)">
                <polygon points="170,280 330,280 340,350 160,350" fill="url(#crossBar)" />
                <polygon points="210,60 290,60 440,500 360,500" fill="url(#rightLeg)" />
                <polygon points="60,500 140,500 290,60 210,60" fill="url(#leftLeg)" />
              </g>
            </svg>
          </Link>

          {/* Mobile Menu Toggle */}
          <div className="relative lg:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center gap-1 text-xs font-bold text-white"
            >
              Browse <span className={cn("transition-transform", isMobileMenuOpen && "rotate-180")}>▼</span>
            </button>
            {isMobileMenuOpen && (
              <div className="absolute left-[-50px] top-full mt-4 w-64 bg-black/95 border-t-2 border-white py-4 shadow-2xl">
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 border-8 border-transparent border-b-white" />
                <ul className="flex flex-col items-center gap-4 text-sm">
                  {navLinks.map((link) => (
                    <li key={link.name}>
                      <Link 
                        href={link.href} 
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="text-gray-300 hover:text-white transition"
                      >
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <ul className="hidden items-center gap-4 text-sm font-medium lg:flex">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="text-gray-300 transition-colors hover:text-white">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-4 lg:gap-6">
          <Search className="h-6 w-6 cursor-pointer text-white" onClick={onSearchClick} />
          
          <button className="text-white transition-transform hover:scale-110 active:scale-95">
            <Bell className="h-6 w-6" />
          </button>
          <div className="group relative">
            <div className="h-8 w-8 cursor-pointer overflow-hidden rounded transition-ring hover:ring-2 hover:ring-white">
              <img 
                src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png" 
                alt="Profile" 
                className="h-full w-full object-cover"
              />
            </div>
            <div className="invisible absolute right-0 top-full pt-4 group-hover:visible animate-in fade-in slide-in-from-top-2">
              <div className="w-48 bg-black/90 p-4 border border-white/10 rounded shadow-2xl">
                <div className="flex items-center gap-2 pb-3 mb-3 border-b border-white/10">
                   <div className="h-6 w-6 rounded overflow-hidden">
                     <img src="https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png" alt="" />
                   </div>
                   <span className="text-sm">User</span>
                </div>
                <ul className="space-y-2 text-sm">
                  <li className="cursor-pointer hover:underline">Manage Profiles</li>
                  <li className="cursor-pointer hover:underline">Account</li>
                  <li className="cursor-pointer hover:underline">Help Center</li>
                  <li className="pt-2 border-t border-white/10 cursor-pointer hover:underline">Sign out of ARSH.FLIX</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
