import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, message = "이 기능을 사용하려면 로그인이 필요합니다." }) => {
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleGoogleLogin = () => {
    const userData = { id: '1', name: 'Google User', email: 'google@example.com', avatar: 'https://via.placeholder.com/40' };
    login('google', userData);
    onClose();
  };

  const handleKakaoLogin = () => {
    const userData = { id: '2', name: 'Kakao User', email: 'kakao@example.com', avatar: 'https://via.placeholder.com/40' };
    login('kakao', userData);
    onClose();
  };

  const handleAppleLogin = () => {
    const userData = { id: '3', name: 'Apple User', email: 'apple@example.com', avatar: 'https://via.placeholder.com/40' };
    login('apple', userData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md mx-4 rounded-2xl bg-white shadow-xl">
        <div className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">로그인 필요</h3>
            <p className="text-gray-600 text-sm">{message}</p>
          </div>
          
          <div className="space-y-3 mb-6">
            <Button
              onClick={handleGoogleLogin}
              className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-3 py-3"
            >
              <i className="fab fa-google text-red-500"></i>
              Google로 계속하기
            </Button>
            
            <Button
              onClick={handleKakaoLogin}
              className="w-full bg-yellow-400 text-black hover:bg-yellow-500 flex items-center justify-center gap-3 py-3"
            >
              <i className="fas fa-comment text-black"></i>
              카카오로 계속하기
            </Button>
            
            <Button
              onClick={handleAppleLogin}
              className="w-full bg-black text-white hover:bg-gray-800 flex items-center justify-center gap-3 py-3"
            >
              <i className="fab fa-apple"></i>
              Apple로 계속하기
            </Button>
          </div>
          
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full border-gray-300 text-gray-600 hover:bg-gray-50"
          >
            나중에 하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal; 