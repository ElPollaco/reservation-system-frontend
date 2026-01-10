import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {useAuth} from '../../context/AuthContext';
import CompanySelector from '../../components/CompanySelector/CompanySelector';
import styles from './CompanySelectPage.module.css';

const CompanySelectPage = () => {
  const {companies, selectCompany, hasCompanySelected, logout, loading, staffMember} = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (hasCompanySelected) {
      navigate('/dashboard');
    }
  }, [hasCompanySelected, navigate]);

  const handleSelectCompany = (company) => {
    selectCompany(company);
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
            <div className="loading">
              <div className="loadingSpinner"></div>
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
          <button className="logoutBtn" onClick={handleLogout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>

        <div className={styles.card}>
          <CompanySelector
            companies={companies}
            staffMember={staffMember}
            onSelect={handleSelectCompany}
          />
        </div>
      </div>
    </div>
  );
};

export default CompanySelectPage;