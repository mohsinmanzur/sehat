import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [email, setEmail] = useState(localStorage.getItem('doctorEmail') || '');
  const [isVerified, setIsVerified] = useState(!!localStorage.getItem('doctorToken'));
  const [doctorName, setDoctorNameState] = useState(localStorage.getItem('doctorName') || 'Doctor');

  const value = useMemo(() => ({
    email,
    doctorName,
    isVerified,
    login(nextEmail) {
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
    setDoctorName(nextName) {
      const safeName = nextName || 'Doctor';
      setDoctorNameState(safeName);
      localStorage.setItem('doctorName', safeName);
    },
  }), [email, doctorName, isVerified]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);