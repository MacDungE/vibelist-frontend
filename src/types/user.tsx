export interface User {
  id: string | number;
  username: string; // 인증용(로그인/댓글 등)
  name: string; // 프로필용(닉네임)
  email?: string;
  avatar: string;
  provider: string;
}
