import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import MenuBar from '../common/MenuBar';

function Footer({ floating = false }: { floating?: boolean } = {}) {
  return floating ? (
    <footer className="fixed left-1/2 z-50 w-full max-w-[38rem] -translate-x-1/2 pointer-events-none"
      style={{
        bottom: 'env(safe-area-inset-bottom,0px)',
        minHeight: '80px',
        paddingBottom: 'env(safe-area-inset-bottom,0px)',
      }}
    >
      <div className="pointer-events-auto">
        <MenuBar className="shadow-xl" />
      </div>
    </footer>
  ) : (
    <footer className="w-full sticky bottom-0 left-0 z-50 bg-gray-50 pb-[env(safe-area-inset-bottom)] flex flex-col justify-center items-center min-h-[80px]">
      <div className="w-full max-w-[1440px] mx-auto flex flex-col justify-center items-center flex-1">
        <MenuBar />
      </div>
    </footer>
  );
}

export default Footer;
export const FloatingFooter = (props: any) => <Footer floating {...props} />; 