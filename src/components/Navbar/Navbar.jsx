import {useNavigate} from 'react-router-dom';
import {useAuth,} from '../../context/AuthContext';
import styles from './Navbar.module.css';
import RoleBadge from "../ui/RoleBadge/RoleBadge.jsx";

const Navbar = () => {
  const {selectedCompany, logout, clearCompanySelection, userRole} = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangeCompany = () => {
    clearCompanySelection();
    navigate('/select-company');
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLeft}>
        {selectedCompany && (
          <div className={styles.companyBadge}>
            <span className={styles.companyName}>{selectedCompany.name}</span>
            <span className={styles.separator}>•</span>
            <RoleBadge role={userRole}/>
          </div>
        )}
      </div>

      <div className={styles.navRight}>
        {selectedCompany && (
          <button className="btn" onClick={handleChangeCompany}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Change Company</span>
          </button>
        )}

        <button className="logoutBtn" onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;