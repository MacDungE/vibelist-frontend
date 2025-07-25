import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Users, House, User } from 'lucide-react';

const NAV_ITEMS = [
  {
    to: '/community',
    icon: <Users className='mb-1 text-2xl sm:text-xl' />,
    label: '커뮤니티',
  },
  {
    to: '/',
    icon: <House className='mb-1 text-2xl sm:text-xl' />,
    label: '홈',
  },
  {
    to: '/profile',
    icon: <User className='mb-1 text-2xl sm:text-xl' />,
    label: '프로필',
  },
];

const MenuBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const location = useLocation();
  return (
    <nav
      role='navigation'
      aria-label='Main bottom'
      className={`mx-auto min-h-[80px] w-full max-w-[38rem] ${className}`}
    >
      <div
        className='relative flex items-center justify-between overflow-hidden rounded-full px-3 py-2.5 sm:px-6 sm:py-3.5'
        style={{ background: 'var(--surface)' }}
      >
        <div
          className='pointer-events-none absolute inset-0 rounded-full border border-transparent opacity-100'
          style={{
            background: 'linear-gradient(180deg, var(--primary), var(--primary-600))',
            padding: '1px',
            margin: '-1px',
            WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
            WebkitMaskComposite: 'xor',
            maskComposite: 'exclude',
          }}
        ></div>
        <ul className='flex w-full items-center justify-center gap-2 px-2 sm:gap-4 sm:px-4'>
          {NAV_ITEMS.map(item => (
            <li key={item.to} className='flex flex-1 justify-center'>
              <Link
                to={item.to}
                role='tab'
                aria-label={item.label}
                aria-current={location.pathname === item.to ? 'page' : undefined}
                className={`!rounded-button group relative flex h-[48px] w-[52px] cursor-pointer flex-col items-center justify-center font-medium whitespace-nowrap transition-transform hover:translate-y-[-3px] sm:w-[100px]`}
                style={{
                  color: location.pathname === item.to ? 'var(--primary)' : 'var(--text-secondary)',
                }}
              >
                {item.icon}
                <span
                  className={`hidden text-sm font-medium sm:block`}
                  style={
                    location.pathname === item.to
                      ? {
                          background: 'linear-gradient(90deg, var(--primary), var(--primary-600))',
                          WebkitBackgroundClip: 'text',
                          color: 'transparent',
                        }
                      : {}
                  }
                >
                  {item.label}
                </span>
                <div
                  className='pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 transform rounded-lg px-3 py-1.5 text-sm whitespace-nowrap opacity-0 transition-opacity duration-200 group-hover:opacity-100 sm:hidden'
                  style={{ background: 'var(--surface-alt)', color: 'var(--text-primary)' }}
                >
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
