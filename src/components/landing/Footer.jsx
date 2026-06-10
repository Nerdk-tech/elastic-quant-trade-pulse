import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100 py-14">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <svg width="28" height="28" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="16" fill="hsl(174,72%,38%)" />
                <circle cx="10" cy="16" r="4" fill="white" />
                <circle cx="22" cy="16" r="4" fill="white" opacity="0.6" />
                <circle cx="16" cy="10" r="3" fill="white" opacity="0.4" />
              </svg>
              <span className="font-display text-lg font-semibold tracking-widest text-gray-900 uppercase">cortex.</span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed max-w-[200px]">
              Better analysis. Better trading. AI-powered crypto & stock platform.
            </p>
          </div>
          {[
            { title: 'Platform', links: ['Features', 'Markets', 'Staking', 'Pricing'] },
            { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
            { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Risk Disclosure'] },
          ].map(col => (
            <div key={col.title}>
              <p className="text-xs font-bold text-gray-800 uppercase tracking-widest mb-4">{col.title}</p>
              <ul className="space-y-2.5">
                {col.links.map(link => (
                  <li key={link}>
                    <a href="#" className="text-sm text-gray-400 hover:text-primary transition-colors">{link}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        {/* Contact info */}
        <div className="mb-8 p-4 rounded-xl bg-gray-50 border border-gray-100 flex flex-wrap items-center gap-6">
          <p className="text-xs font-bold text-gray-700 uppercase tracking-widest">Contact Us</p>
          <a href="tel:+447537175299" className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-1.5">
            📞 <span>+44 7537 175299</span>
          </a>
          <a href="https://t.me/Cortextradehq" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-1.5">
            ✈️ <span>@Cortextradehq</span>
          </a>
          <a href="mailto:support@cortextrade.com" className="text-sm text-gray-500 hover:text-primary transition-colors flex items-center gap-1.5">
            ✉️ <span>support@cortextrade.com</span>
          </a>
        </div>
        <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Cortex. All rights reserved.</p>
          <p className="text-xs text-gray-400 text-center sm:text-right max-w-md">
            Trading involves significant risk of loss. Past performance does not guarantee future results.
          </p>
        </div>
      </div>
    </footer>
  );
}