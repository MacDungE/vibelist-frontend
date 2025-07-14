import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { House, Compass, CircleUserRound } from 'lucide-react';

const navItems = [
  { key: 'home', icon: <House className={'size-5'} />, path: '/home', label: '홈' },
  { key: 'explore', icon: <Compass className={'size-5'} />, path: '/explore', label: '탐색' },
  {
    key: 'profile',
    icon: <CircleUserRound className={'size-5'} />,
    path: '/profile',
    label: '프로필',
  },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const active = navItems.find(item => location.pathname.startsWith(item.path))?.key || 'home';

  return (
    <nav className='fixed bottom-4 left-1/2 z-40 flex w-[92vw] max-w-[480px] -translate-x-1/2 items-center justify-around rounded-[18px] border border-[#E5E5E5] bg-white p-0 shadow-[0_8px_18px_rgba(0,0,0,0.08)]'>
      {navItems.map(item => {
        const isActive = active === item.key;

        return (
          <button
            key={item.key}
            className={cn(
              'group relative flex h-full min-w-[44px] flex-1 cursor-pointer flex-col items-center justify-center py-2 font-semibold transition',
              isActive && 'text-primary font-bold'
            )}
            onClick={() => navigate(item.path)}
            aria-label={item.label}
          >
            <span className='flex items-center justify-center'>{item.icon}</span>
            <span
              className={cn(
                'mt-0.5 border-b-2 border-transparent text-sm transition',
                isActive && 'border-b-primary'
              )}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
