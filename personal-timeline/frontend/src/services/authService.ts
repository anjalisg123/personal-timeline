import type { User } from '../types/User';

export const authService = {
  async loginWithProvider(provider: 'google' | 'github') {
    // mock: in real app, redirect to backend /auth/{provider}
    const user: User = {
      id: 1,
      displayName: 'Anjali Gudimani',
      email: 'anjalisgudimani@gmail.com',
      profileImageUrl: 'https://i.pravatar.cc/100?img=65',
      timezone: 'America/Chicago',
    };
    const token = 'mock-jwt-token';
    return { user, token };
  },
  async me(token?: string): Promise<User | null> {
    // mock returns same user if token exists
    if (!token) return null;
    return {
      id: 1,
      displayName: 'Anjali Gudimani',
      email: 'anjalisgudimani@gmail.com',
      profileImageUrl: 'https://i.pravatar.cc/100?img=65',
      timezone: 'America/Chicago',
    };
  },
  async logout() {
    return true;
  },
};