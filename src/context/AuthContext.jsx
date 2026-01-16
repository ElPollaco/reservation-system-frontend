// src/context/AuthContext.jsx
import {createContext, useContext, useState, useEffect} from 'react';
import {authApi, staffMemberCompanyApi} from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// StaffRole enum zgodnie z API
export const StaffRole = {
  Manager: 0,
  ReceptionEmployee: 1,
  Trainer: 2,
};

// Mapowanie string z API na enum
export const parseRole = (roleString) => {
  if (typeof roleString === 'number')
    return roleString;
  const roleMap = {
    'Manager': StaffRole.Manager,
    'ReceptionEmployee': StaffRole.ReceptionEmployee,
    'Trainer': StaffRole.Trainer,
  };
  return roleMap[roleString] ?? StaffRole.Trainer;
};

export const getRoleName = (role) => {
  if (typeof role === 'string') {
    return role;
  }
  switch (role) {
    case StaffRole.Manager:
      return 'Manager';
    case StaffRole.ReceptionEmployee:
      return 'Reception Employee';
    case StaffRole.Trainer:
      return 'Trainer';
    default:
      return 'Unknown';
  }
};

export const AuthProvider = ({children}) => {
  const [user, setUser] = useState(null);
  const [staffMember, setStaffMember] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      const savedCompany = localStorage.getItem('selectedCompany');
      const savedRole = localStorage.getItem('userRole');
      const savedStaffMember = localStorage.getItem('staffMember');

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        if (savedCompany) {
          setSelectedCompany(JSON.parse(savedCompany));
        }

        if (savedRole !== null) {
          setUserRole(parseInt(savedRole));
        }

        if (savedStaffMember) {
          setStaffMember(JSON.parse(savedStaffMember));
        }

        try {
          const response = await staffMemberCompanyApi.getCompanies();
          const {staffMember: staff, companies: companiesList} = response.data;

          setStaffMember(staff);
          setCompanies(companiesList);
          localStorage.setItem('staffMember', JSON.stringify(staff));

          // Ustaw rolę z API jeśli nie była zapisana
          if (savedRole === null && staff?.role) {
            const parsedRole = parseRole(staff.role);
            setUserRole(parsedRole);
            localStorage.setItem('userRole', parsedRole.toString());
          }
        } catch (error) {
          console.error('Failed to fetch companies:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authApi.login({email, password});
      const {token: newToken, ...userData} = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      // Pobierz firmy i dane użytkownika
      const companiesResponse = await staffMemberCompanyApi.getCompanies();
      const {staffMember: staff, companies: companiesList} = companiesResponse.data;

      setStaffMember(staff);
      setCompanies(companiesList);
      localStorage.setItem('staffMember', JSON.stringify(staff));

      // Ustaw rolę z API
      if (staff?.role) {
        const parsedRole = parseRole(staff.role);
        setUserRole(parsedRole);
        localStorage.setItem('userRole', parsedRole.toString());
      }

      return {success: true};
    } catch (error) {
      return {
        success: false,
        error: error.response?.data
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedCompany');
    localStorage.removeItem('userRole');
    localStorage.removeItem('staffMember');
    setToken(null);
    setUser(null);
    setStaffMember(null);
    setSelectedCompany(null);
    setCompanies([]);
    setUserRole(null);
  };

  const selectCompany = (company) => {
    setSelectedCompany(company);
    localStorage.setItem('selectedCompany', JSON.stringify(company));
  };

  const clearCompanySelection = () => {
    setSelectedCompany(null);
    localStorage.removeItem('selectedCompany');
  };

  const isManager = () => userRole === StaffRole.Manager;
  const isReceptionEmployee = () => userRole === StaffRole.ReceptionEmployee;
  const isTrainer = () => userRole === StaffRole.Trainer;

  const value = {
    user,
    staffMember,
    token,
    selectedCompany,
    companies,
    userRole,
    loading,
    login,
    logout,
    selectCompany,
    clearCompanySelection,
    isManager,
    isReceptionEmployee,
    isTrainer,
    isAuthenticated: !!token,
    hasCompanySelected: !!selectedCompany,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;