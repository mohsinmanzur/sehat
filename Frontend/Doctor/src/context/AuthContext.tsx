import { createContext, useContext, useMemo, useState } from 'react';

interface AuthContextType
{
    email: string;
    doctorName: string;
    isVerified: boolean;
    login(nextEmail: string): void;
    verify(): void;
    logout(): void;
    setDoctorName(nextName: string): void;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [email, setEmail] = useState(localStorage.getItem('doctorEmail') || '');
  const [isVerified, setIsVerified] = useState(!!localStorage.getItem('doctorToken'));
  const [doctorName, setDoctorNameState] = useState(localStorage.getItem('doctorName') || 'Doctor');

  const value = useMemo(() => ({
    email,
    doctorName,
    isVerified,
    login(nextEmail: string) {
      setEmail(nextEmail);
      localStorage.setItem('doctorEmail', nextEmail);
    },
    verify() {
      setIsVerified(true);
    },
    logout() {
      setIsVerified(false);
      setEmail('');
      setDoctorNameState('Doctor');
      localStorage.removeItem('doctorToken');
      localStorage.removeItem('doctorEmail');
      localStorage.removeItem('doctorName');
      localStorage.removeItem('selectedPatientId');
      localStorage.removeItem('selectedPatientName');
    },
    setDoctorName(nextName: string) {
      const safeName = nextName || 'Doctor';
      setDoctorNameState(safeName);
      localStorage.setItem('doctorName', safeName);
    },
  }), [email, doctorName, isVerified]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};