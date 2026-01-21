import { jwtDecode } from "jwt-decode";

interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export const loginWithGoogle = async (credential: string): Promise<{ success: boolean; user?: User; error?: string }> => {
  try {
    const decoded: any = jwtDecode(credential);
    const userData = {
      id: decoded.sub,
      name: decoded.name,
      email: decoded.email,
      picture: decoded.picture
    };
    
    // Store in localStorage for now
    localStorage.setItem('user', JSON.stringify(userData));
    return { success: true, user: userData };
  } catch (error) {
    console.error('Google login error:', error);
    return { success: false, error: 'Google login failed' };
  }
};

export const logout = () => {
  localStorage.removeItem('user');
};

export const getCurrentUser = (): User | null => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};
