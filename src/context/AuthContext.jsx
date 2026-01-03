// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authApi, staffMemberCompanyApi } from '../api/api';

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

export const getRoleName = (role) => {
  // Role może być stringiem lub liczbą
  if (typeof role === 'string') {
    return role;
  }
  switch (role) {
    case StaffRole.Manager: return 'Manager';
    case StaffRole.ReceptionEmployee: return 'ReceptionEmployee';
    case StaffRole.Trainer: return 'Trainer';
    default: return 'Unknown';
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
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

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));

        if (savedCompany) {
          setSelectedCompany(JSON.parse(savedCompany));
        }

        if (savedRole !== null) {
          setUserRole(parseInt(savedRole));
        }

        try {
          const response = await staffMemberCompanyApi.getCompanies();
          setCompanies(response.data);
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
      const response = await authApi.login({ email, password });
      const { token: newToken, ...userData } = response.data;

      localStorage.setItem('token', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      // Pobierz firmy użytkownika
      const companiesResponse = await staffMemberCompanyApi.getCompanies();
      setCompanies(companiesResponse.data);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.response?.data || 'Login failed'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('selectedCompany');
    localStorage.removeItem('userRole');
    setToken(null);
    setUser(null);
    setSelectedCompany(null);
    setCompanies([]);
    setUserRole(null);
  };

  const selectCompany = (company, role) => {
    setSelectedCompany(company);
    setUserRole(role);
    localStorage.setItem('selectedCompany', JSON.stringify(company));
    localStorage.setItem('userRole', role.toString());
  };

  const clearCompanySelection = () => {
    setSelectedCompany(null);
    setUserRole(null);
    localStorage.removeItem('selectedCompany');
    localStorage.removeItem('userRole');
  };

  const isManager = () => userRole === StaffRole.Manager;
  const isReceptionEmployee = () => userRole === StaffRole.ReceptionEmployee;
  const isTrainer = () => userRole === StaffRole.Trainer;

  const value = {
    user,
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