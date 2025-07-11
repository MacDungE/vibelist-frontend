import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  {
    to: '/community',
    icon: 'fas fa-users',
    label: '커뮤니티',
  },
  {
    to: '/',
    icon: 'fas fa-home',
    label: '홈',
  },
  {
    to: '/profile',
    icon: 'fas fa-user',
    label: '프로필',
  },
];

const MenuBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const location = useLocation();
  return (
    <nav
      role="navigation"
      aria-label="Main bottom"
      className={`w-full max-w-[38rem] mx-auto min-h-[80px] ${className}`}
    >
      <div className="flex items-center justify-between rounded-full px-3 sm:px-6 py-2.5 sm:py-3.5 relative overflow-hidden" style={{ background: 'var(--surface)' }}>
        <div
          className="absolute inset-0 border border-transparent rounded-full pointer-events-none opacity-100"
          style={{ background: 'linear-gradient(180deg, var(--primary), var(--primary-600))' }}
          style={{
            padding: '1px',
            margin: '-1px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        ></div>
        <ul className="flex items-center justify-center gap-2 sm:gap-4 w-full px-2 sm:px-4">
          {NAV_ITEMS.map((item) => (
            <li key={item.to} className="flex-1 flex justify-center">
              <Link
                to={item.to}
                role="tab"
                aria-label={item.label}
                aria-current={location.pathname === item.to ? 'page' : undefined}
                className={`!rounded-button whitespace-nowrap flex flex-col items-center justify-center w-[52px] h-[48px] sm:w-[100px] font-medium cursor-pointer group hover:translate-y-[-3px] transition-transform relative`}
                style={{ color: location.pathname === item.to ? 'var(--primary)' : 'var(--text-secondary)' }}
              >
                <i
                  className={`${item.icon} sm:text-xl text-2xl mb-1`}
                  style={location.pathname === item.to ? { background: 'linear-gradient(90deg, var(--primary), var(--primary-600))', WebkitBackgroundClip: 'text', color: 'transparent' } : {}}
                ></i>
                <span
                  className={`hidden sm:block text-sm font-medium`}
                  style={location.pathname === item.to ? { background: 'linear-gradient(90deg, var(--primary), var(--primary-600))', WebkitBackgroundClip: 'text', color: 'transparent' } : {}}
                >
                  {item.label}
                </span>
                <div className="sm:hidden absolute -top-10 left-1/2 transform -translate-x-1/2 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ background: 'var(--surface-alt)', color: 'var(--text-primary)' }}>
                  {item.label}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

export default MenuBar; 