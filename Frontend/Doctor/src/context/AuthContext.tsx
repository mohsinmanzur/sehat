import { createContext, useContext, useMemo, useState } from 'react';

type StoredDoctorProfile = {
  fullName: string;
  email: string;
  hospital: string;
};

type AuthContextType = {
  email: string;
  isVerified: boolean;
  doctorName: string;
  doctorFullName: string;
  doctorEmail: string;
  doctorHospital: string;
  login: (nextEmail: string) => void;
  verify: () => void;
  logout: () => void;
  setDoctorProfile: (profile: {
    fullName?: string;
    email?: string;
    hospital?: string;
  }) => void;
  updateDoctorProfileLocal: (profile: {
    email?: string;
    hospital?: string;
  }) => void;
  loadDoctorProfileByEmail: (targetEmail: string) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const normalizeEmail = (value?: string) => (value || '').trim().toLowerCase();

const buildDoctorShortName = (fullName?: string) => {
  const clean = (fullName || '').trim();
  if (!clean) return 'Doctor';

  const parts = clean.split(/\s+/).filter(Boolean);

  if (parts.length >= 3) {
    return `Doctor ${parts[1]}`;
  }

  return `Doctor ${parts[0]}`;
};

const getProfilesMap = (): Record<string, StoredDoctorProfile> => {
  try {
    const raw = localStorage.getItem('doctorProfilesByEmail');
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const saveProfilesMap = (map: Record<string, StoredDoctorProfile>) => {
  localStorage.setItem('doctorProfilesByEmail', JSON.stringify(map));
};

const saveProfileForEmail = (profile: StoredDoctorProfile) => {
  const key = normalizeEmail(profile.email);
  if (!key) return;

  const map = getProfilesMap();
  map[key] = {
    fullName: (profile.fullName || '').trim(),
    email: (profile.email || '').trim(),
    hospital: (profile.hospital || '').trim(),
  };
  saveProfilesMap(map);
};

const getProfileForEmail = (email: string): StoredDoctorProfile | null => {
  const key = normalizeEmail(email);
  if (!key) return null;

  const map = getProfilesMap();
  return map[key] || null;
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialEmail = localStorage.getItem('doctorEmail') || '';
  const initialProfile = getProfileForEmail(initialEmail);

  const [email, setEmail] = useState(initialEmail);
  const [isVerified, setIsVerified] = useState(!!localStorage.getItem('doctorToken'));
  const [doctorFullName, setDoctorFullName] = useState(
    localStorage.getItem('doctorFullName') || initialProfile?.fullName || ''
  );
  const [doctorEmail, setDoctorEmail] = useState(
    localStorage.getItem('doctorEmail') || initialProfile?.email || ''
  );
  const [doctorHospital, setDoctorHospital] = useState(
    localStorage.getItem('doctorHospital') || initialProfile?.hospital || ''
  );

  const doctorName = buildDoctorShortName(doctorFullName);

  const value = useMemo(
    () => ({
      email,
      isVerified,
      doctorName,
      doctorFullName,
      doctorEmail,
      doctorHospital,

      login(nextEmail: string) {
        const cleanEmail = nextEmail.trim();
        setEmail(cleanEmail);
        setDoctorEmail(cleanEmail);
        localStorage.setItem('doctorEmail', cleanEmail);

        const existingProfile = getProfileForEmail(cleanEmail);
        if (existingProfile) {
          setDoctorFullName(existingProfile.fullName || '');
          setDoctorHospital(existingProfile.hospital || '');

          localStorage.setItem('doctorFullName', existingProfile.fullName || '');
          localStorage.setItem('doctorHospital', existingProfile.hospital || '');
        }
      },

      verify() {
        setIsVerified(true);
      },

      logout() {
        setIsVerified(false);
        setEmail('');
        setDoctorFullName('');
        setDoctorEmail('');
        setDoctorHospital('');

        localStorage.removeItem('doctorToken');
        localStorage.removeItem('doctorEmail');
        localStorage.removeItem('doctorFullName');
        localStorage.removeItem('doctorHospital');
        localStorage.removeItem('selectedPatientId');
        localStorage.removeItem('selectedPatientName');
      },

      setDoctorProfile(profile: { fullName?: string; email?: string; hospital?: string }) {
        const nextFullName =
          profile.fullName !== undefined ? profile.fullName.trim() : doctorFullName;
        const nextEmail =
          profile.email !== undefined ? profile.email.trim() : (doctorEmail || email).trim();
        const nextHospital =
          profile.hospital !== undefined ? profile.hospital.trim() : doctorHospital;

        if (profile.fullName !== undefined) {
          setDoctorFullName(nextFullName);
          localStorage.setItem('doctorFullName', nextFullName);
        }

        if (profile.email !== undefined) {
          setEmail(nextEmail);
          setDoctorEmail(nextEmail);
          localStorage.setItem('doctorEmail', nextEmail);
        }

        if (profile.hospital !== undefined) {
          setDoctorHospital(nextHospital);
          localStorage.setItem('doctorHospital', nextHospital);
        }

        const finalEmail = nextEmail || doctorEmail || email;
        if (finalEmail) {
          saveProfileForEmail({
            fullName: nextFullName,
            email: finalEmail,
            hospital: nextHospital,
          });
        }
      },

      updateDoctorProfileLocal(profile: { email?: string; hospital?: string }) {
        const oldEmail = normalizeEmail(doctorEmail || email);
        const nextEmail =
          profile.email !== undefined ? profile.email.trim() : (doctorEmail || email).trim();
        const nextHospital =
          profile.hospital !== undefined ? profile.hospital.trim() : doctorHospital;

        setEmail(nextEmail);
        setDoctorEmail(nextEmail);
        setDoctorHospital(nextHospital);

        localStorage.setItem('doctorEmail', nextEmail);
        localStorage.setItem('doctorHospital', nextHospital);

        const map = getProfilesMap();
        if (oldEmail && oldEmail !== normalizeEmail(nextEmail)) {
          delete map[oldEmail];
        }

        map[normalizeEmail(nextEmail)] = {
          fullName: doctorFullName,
          email: nextEmail,
          hospital: nextHospital,
        };

        saveProfilesMap(map);
      },

      loadDoctorProfileByEmail(targetEmail: string) {
        const found = getProfileForEmail(targetEmail);

        if (!found) {
          setDoctorFullName('');
          setDoctorHospital('');
          return;
        }

        setDoctorFullName(found.fullName || '');
        setDoctorEmail(found.email || targetEmail);
        setDoctorHospital(found.hospital || '');

        localStorage.setItem('doctorFullName', found.fullName || '');
        localStorage.setItem('doctorEmail', found.email || targetEmail);
        localStorage.setItem('doctorHospital', found.hospital || '');
      },
    }),
    [email, isVerified, doctorName, doctorFullName, doctorEmail, doctorHospital]
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