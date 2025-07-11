import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { key: 'home', icon: 'fas fa-home', path: '/home', label: '홈' },
  { key: 'explore', icon: 'fas fa-compass', path: '/explore', label: '탐색' },
  { key: 'profile', icon: 'fas fa-user', path: '/profile', label: '프로필' },
];

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const active = navItems.find(item => location.pathname.startsWith(item.path))?.key || 'home';

  return (
    <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[92vw] max-w-[480px] h-[58px] bg-white border border-[#E5E5E5] rounded-[18px] shadow-[0_8px_18px_rgba(0,0,0,0.08)] flex justify-around items-center" style={{padding:0}}>
      {navItems.map((item) => (
        <button
          key={item.key}
          className={`flex flex-col items-center justify-center flex-1 h-full relative transition group ${active === item.key ? 'font-bold' : ''}`}
          onClick={() => navigate(item.path)}
          aria-label={item.label}
          style={{ minWidth: '44px' }}
        >
          <span className="flex items-center justify-center">
            <i className={`${item.icon} text-[22px] sm:text-[24px]`} style={{ color: active === item.key ? 'var(--primary)' : 'var(--text-secondary)' }}></i>
          </span>
          <span className={`text-[11px] mt-0.5 ${active === item.key ? 'text-[var(--primary)]' : 'text-[var(--text-secondary)]'} transition`}>{item.label}</span>
          {/* Active indicator dot */}
          {active === item.key && (
            <span className="absolute left-1/2 -translate-x-1/2 bottom-2 w-2 h-[3px] rounded-full" style={{ background: 'var(--primary)' }}></span>
          )}
        </button>
      ))}
    </nav>
  );
};

export default BottomNav; 