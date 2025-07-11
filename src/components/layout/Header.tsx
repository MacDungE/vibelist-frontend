import React, { useEffect, useState } from 'react';

function Header() {
  // 다크모드 토글 상태
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
      // prefers-color-scheme
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <header className="w-full sticky top-0 z-50" style={{ background: 'var(--surface)' }}>
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 flex items-center justify-between h-[var(--header-height,5rem)] relative">
        {/* 좌측 여백 */}
        <div className="w-10 h-10 flex-shrink-0"></div>
        {/* 중앙 로고 */}
        <h1 className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-3xl lg:text-4xl font-bold tracking-[-0.01em] bg-clip-text text-transparent bg-gradient-to-r from-[#BFA9F2] to-[#C7B6FF] select-none">VibeList</h1>
        {/* 우측 토글 버튼 */}
        <button
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? '라이트모드로 전환' : '다크모드로 전환'}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-[var(--surface-alt)] transition ml-auto"
          style={{ color: 'var(--primary-600)' }}
        >
          {theme === 'dark' ? (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1111.21 3a7 7 0 109.79 9.79z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          ) : (
            <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="2"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          )}
        </button>
      </div>
    </header>
  );
}
export default Header; 