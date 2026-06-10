import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// ORTEX-exact teal navbar
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const navLinks = [
    { label: 'Data', href: '#markets' },
    { label: 'Ideas', href: '#features' },
    { label: 'Features', href: '#features' },
    { label: 'APIs', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Articles', href: '#faq' },
    { label: 'Careers', href: '#' },
    { label: 'Contact', href: '#' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'hsl(174,65%,38%)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo - ORTEX style: circle icon + wordmark */}
          <Link to="/" className="flex items-center gap-2.5">
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none">
              <circle cx="16" cy="16" r="16" fill="white" opacity="0.2" />
              <circle cx="10" cy="16" r="5" fill="white" />
              <circle cx="22" cy="16" r="5" fill="white" opacity="0.5" />
              <circle cx="16" cy="10" r="3.5" fill="white" opacity="0.35" />
            </svg>
            <span className="font-display text-lg font-semibold tracking-widest text-white uppercase">
              cortex.
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map(link => (
              <a key={link.label} href={link.href} className="text-sm text-white/80 hover:text-white transition-colors font-medium">
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTAs */}
          <div className="hidden lg:flex items-center gap-2">
            <Button variant="ghost" className="text-sm text-white hover:text-white hover:bg-white/15 h-9 px-4 font-medium"
              onClick={() => navigate('/login')}>
              Log in
            </Button>
            <Button className="text-sm bg-red-500 hover:bg-red-600 text-white font-semibold px-5 h-9 rounded-full"
              onClick={() => navigate('/register')}>
              Join for free
            </Button>
          </div>

          {/* Mobile hamburger - ORTEX style: white lines on teal */}
          <button className="lg:hidden text-white p-1" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-6 h-6" /> : (
              <div className="flex flex-col gap-1.5">
                <span className="block w-6 h-0.5 bg-white" />
                <span className="block w-6 h-0.5 bg-white" />
                <span className="block w-6 h-0.5 bg-white" />
              </div>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} style={{ background: 'hsl(174,65%,34%)' }}>
            <div className="px-4 py-5 space-y-1">
              {navLinks.map(link => (
                <a key={link.label} href={link.href} className="block text-sm text-white/90 hover:text-white py-2.5 font-medium border-b border-white/10" onClick={() => setMobileOpen(false)}>{link.label}</a>
              ))}
              <div className="flex flex-col gap-2 pt-4">
                <Button variant="ghost" className="w-full text-white hover:bg-white/15"
                  onClick={() => { navigate('/login'); setMobileOpen(false); }}>Log in</Button>
                <Button className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full"
                  onClick={() => { navigate('/register'); setMobileOpen(false); }}>Join for free</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}