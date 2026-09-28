import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  type: 'farmer' | 'buyer';
  location: string;
  phone: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, type: 'farmer' | 'buyer') => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ✅ Spring Boot backend base URL
const API_BASE_URL = 'http://localhost:8080';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Restore user from localStorage on page refresh
  useEffect(() => {
    const savedEmail = localStorage.getItem('authUsername');
    const savedType = localStorage.getItem('authUserType') as 'farmer' | 'buyer' | null;

    if (savedEmail && savedType) {
      setUser({
        id: savedEmail,
        name: savedEmail,
        email: savedEmail,
        type: savedType,
        location: '',
        phone: '',
      });
    }
  }, []);

  // =========================
  // LOGIN → /api/auth/login
  // Enforces correct role: FARMER vs BUYER
  // =========================
  const login = async (email: string, password: string, type: 'farmer' | 'buyer') => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // backend expects "username" field
        username: email, // we store email as username
        password: password,
      }),
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || 'Login failed');
    }

    const data = (await response.json()) as {
      token: string;
      type: string;
      username: string;
      roles?: string[];
    };

    const backendRoles = data.roles || [];

    // Map backend roles (FARMER/BUYER) to frontend types (farmer/buyer)
    let backendRole: 'farmer' | 'buyer' | null = null;
    if (backendRoles.includes('FARMER')) {
      backendRole = 'farmer';
    } else if (backendRoles.includes('BUYER')) {
      backendRole = 'buyer';
    }

    if (!backendRole) {
      throw new Error('No valid role is assigned to this account.');
    }

    // ✅ IMPORTANT: Enforce that selected UI role matches backend role
    if (backendRole !== type) {
      const backendLabel = backendRole === 'farmer' ? 'Farmer' : 'Buyer';
      const selectedLabel = type === 'farmer' ? 'Farmer' : 'Buyer';
      throw new Error(
        `This account is registered as ${backendLabel}. You cannot sign in as ${selectedLabel}.`
      );
    }

    // Save token + basic user info for later API calls
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('authUsername', data.username); // email
    localStorage.setItem('authEmail', email);
    localStorage.setItem('authUserType', backendRole); // "farmer" or "buyer"

    // Set user in React state so dashboard knows who is logged in
    setUser({
      id: data.username,
      name: data.username, // we don't yet store a separate display name
      email,
      type: backendRole,
      location: '',
      phone: '',
    });
  };

  // =========================
  // REGISTER → /api/auth/register
  // Creates user as FARMER or BUYER
  // =========================
  const register = async (userData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: userData.email, // email used as username
        email: userData.email,
        password: userData.password,
        roles: [userData.type === 'farmer' ? 'FARMER' : 'BUYER'],
      }),
    });

    if (!response.ok) {
      const msg = await response.text();
      throw new Error(msg || 'Registration failed');
    }

    // After successful signup, automatically log in
    await login(userData.email, userData.password, userData.type);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUsername');
    localStorage.removeItem('authEmail');
    localStorage.removeItem('authUserType');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
