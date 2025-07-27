import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { NavLink } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  message = '이 기능을 사용하려면 로그인이 필요합니다.',
}) => {
  const { login } = useAuth();

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50'>
      <div className='mx-4 w-full max-w-md rounded-2xl bg-white shadow-xl'>
        <div className='p-6'>
          <div className='mb-6 text-center'>
            <h3 className='mb-2 text-xl font-bold text-gray-900'>로그인 필요</h3>
            <p className='text-sm text-gray-600'>{message}</p>
          </div>

          <div className='mb-6 space-y-3'>
            <NavLink
              to={'/login'}
              className='flex w-full items-center justify-center gap-3 border border-gray-300 bg-white py-3 text-gray-700 hover:bg-gray-50'
            >
              <i className='fab fa-google text-red-500'></i>
              로그인 페이지로 이동
            </NavLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
