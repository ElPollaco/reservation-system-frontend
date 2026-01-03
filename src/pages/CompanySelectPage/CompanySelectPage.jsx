// src/pages/CompanySelectPage.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CompanySelector from '../../components/CompanySelector/CompanySelector';
import styles from './CompanySelectPage.module.css';

const CompanySelectPage = () => {
  const { companies, selectCompany, hasCompanySelected, logout, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (hasCompanySelected) {
      navigate('/dashboard');
    }
  }, [hasCompanySelected, navigate]);

  const handleSelectCompany = (company, role) => {
    selectCompany(company, role);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.card}>
            <div className={styles.loading}>
              <div className={styles.loadingSpinner}></div>
              <span>Loading your companies...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.logo}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
            </div>
            <div>
              <h1 className={styles.headerTitle}>Select Your Company</h1>
              <p className={styles.headerSubtitle}>Choose where you want to work today</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>

        <div className={styles.card}>
          {companies.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <h3 className={styles.emptyTitle}>No Companies Available</h3>
              <p className={styles.emptyMessage}>
                You are not assigned to any company yet. Please contact your administrator to get access.
              </p>
              <button className={styles.contactBtn}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Contact Support
              </button>
            </div>
          ) : (
            <CompanySelector
              companies={companies}
              onSelect={handleSelectCompany}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanySelectPage;