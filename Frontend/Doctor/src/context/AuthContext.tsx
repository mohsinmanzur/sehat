import { createContext, useContext, useMemo, useState } from 'react';

const getDoctorDisplayName = (firstName?: string) => {
  if (!firstName) return 'Doctor';

  const parts = firstName.trim().split(/\s+/);

  if (parts.length >= 2) {
    return `Doctor ${parts[1]}`;
  }

  return `Doctor ${parts[0]}`;
};

type AuthContextType = {
  email: string;
  doctorName: string;
  doctorFullName: string;
  doctorFirstName: string;
  doctorLastName: string;
  isVerified: boolean;
  login: (nextEmail: string) => void;
  verify: () => void;
  logout: () => void;
  setDoctorProfile: (profile: {
    firstName?: string;
    lastName?: string;
    fullName?: string;
  }) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const storedFirstName = localStorage.getItem('doctorFirstName') || '';
  const storedLastName = localStorage.getItem('doctorLastName') || '';
  const storedFullName =
    localStorage.getItem('doctorFullName') ||
    `${storedFirstName} ${storedLastName}`.trim();
  const storedDisplayName =
    localStorage.getItem('doctorName') || getDoctorDisplayName(storedFirstName);

  const [email, setEmail] = useState(localStorage.getItem('doctorEmail') || '');
  const [isVerified, setIsVerified] = useState(!!localStorage.getItem('doctorToken'));
  const [doctorFirstName, setDoctorFirstName] = useState(storedFirstName);
  const [doctorLastName, setDoctorLastName] = useState(storedLastName);
  const [doctorFullName, setDoctorFullName] = useState(storedFullName);
  const [doctorName, setDoctorName] = useState(storedDisplayName);

  const value = useMemo(
    () => ({
      email,
      doctorName,
      doctorFullName,
      doctorFirstName,
      doctorLastName,
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
        setDoctorFirstName('');
        setDoctorLastName('');
        setDoctorFullName('');
        setDoctorName('Doctor');

        localStorage.removeItem('doctorToken');
        localStorage.removeItem('doctorEmail');
        localStorage.removeItem('doctorName');
        localStorage.removeItem('doctorFullName');
        localStorage.removeItem('doctorFirstName');
        localStorage.removeItem('doctorLastName');
        localStorage.removeItem('selectedPatientId');
        localStorage.removeItem('selectedPatientName');
      },

      setDoctorProfile(profile: { firstName?: string; lastName?: string; fullName?: string }) {
        let firstName = profile.firstName?.trim() || '';
        let lastName = profile.lastName?.trim() || '';
        let fullName = profile.fullName?.trim() || '';

        if (!fullName && (firstName || lastName)) {
          fullName = `${firstName} ${lastName}`.trim();
        }

        if (!firstName && fullName) {
          const fullParts = fullName.split(/\s+/);

          if (fullParts.length >= 3) {
            firstName = `${fullParts[0]} ${fullParts[1]}`;
            lastName = fullParts.slice(2).join(' ');
          } else if (fullParts.length === 2) {
            firstName = fullParts[0];
            lastName = fullParts[1];
          } else if (fullParts.length === 1) {
            firstName = fullParts[0];
          }
        }

        const displayName = getDoctorDisplayName(firstName);

        setDoctorFirstName(firstName);
        setDoctorLastName(lastName);
        setDoctorFullName(fullName);
        setDoctorName(displayName);

        localStorage.setItem('doctorFirstName', firstName);
        localStorage.setItem('doctorLastName', lastName);
        localStorage.setItem('doctorFullName', fullName);
        localStorage.setItem('doctorName', displayName);
      },
    }),
    [
      email,
      doctorName,
      doctorFullName,
      doctorFirstName,
      doctorLastName,
      isVerified,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
};