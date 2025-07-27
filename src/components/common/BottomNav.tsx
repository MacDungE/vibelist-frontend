import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { CircleUserRound, Compass, PlusCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
  { key: '/explore', icon: <Compass className={'size-8'} />, path: '/explore', label: '탐색' },
  { key: '/', icon: <PlusCircle className={'size-8'} />, path: '/', label: '홈' },
  {
    key: '/:username',
    icon: <CircleUserRound className={'size-8'} />,
    // path는 런타임에 결정
    label: '프로필',
  },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  // 프로필 경로 계산
  const profilePath = user?.username ?? 'login';
  // 현재 경로가 로그인한 사용자의 프로필인지 확인
  const isOwnProfile = useMemo(() => {
    return !!user?.username && location.pathname.includes(user.username);
  }, [location, user]);

  return (
    <nav className='fixed bottom-4 left-1/2 z-40 flex w-[92vw] max-w-[480px] -translate-x-1/2 items-center justify-around rounded-[18px] border border-[#E5E5E5] bg-white p-0 shadow-[0_8px_18px_rgba(0,0,0,0.08)]'>
      {navItems.map(item => {
        const isUserNamePath = /username/.test(item.key);
        const path = isUserNamePath ? profilePath : item.key;

        return (
          <NavLink
            key={item.key}
            to={path}
            title={item.label}
            className={({ isActive }) => {
              // 프로필 탭의 경우 특별한 처리
              const shouldBeActive = isUserNamePath ? isActive && isOwnProfile : isActive;

              return cn(
                'group relative flex h-full min-w-[44px] flex-1 cursor-pointer flex-col items-center justify-center py-3 font-semibold transition',
                shouldBeActive && 'border-b-primary text-primary font-bold'
              );
            }}
            aria-label={item.label}
          >
            <span className='flex items-center justify-center'>{item.icon}</span>
            {/*<span className={'mt-0.5 border-b-2 border-transparent text-sm transition'}>
              {item.label}
            </span>*/}
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNav;
