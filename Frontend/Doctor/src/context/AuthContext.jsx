import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [email, setEmail] = useState('dr.ayesha@sehatscan.com');
  const [isVerified, setIsVerified] = useState(false);
  const [doctorName, setDoctorName] = useState('Dr. Ayesha Khan');

  const value = useMemo(() => ({
    email,
    doctorName,
    isVerified,
    login(nextEmail) {
      setEmail(nextEmail);
    },
    verify() {
      setIsVerified(true);
    },
    logout() {
      setIsVerified(false);
    },
    setDoctorName,
  }), [email, doctorName, isVerified]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
