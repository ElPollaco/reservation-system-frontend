// src/components/Navbar/Navbar.jsx
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, getRoleName, StaffRole } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar = () => {
  const { user, selectedCompany, logout, clearCompanySelection, userRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangeCompany = () => {
    clearCompanySelection();
    navigate('/select-company');
  };

  const getInitials = (user) => {
    if (user?.firstName && user?.lastName) {
      return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
    }
    return user?.email?.[0]?.toUpperCase() || 'U';
  };

  const getRoleClass = (role) => {
    const roleNum = typeof role === 'string' ? StaffRole[role] : role;
    switch (roleNum) {
      case StaffRole.Manager:
        return styles.roleManager;
      case StaffRole.ReceptionEmployee:
        return styles.roleReception;
      case StaffRole.Trainer:
        return styles.roleTrainer;
      default:
        return styles.roleTrainer;
    }
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLeft}>
        <Link to="/dashboard" className={styles.logo}>
          <div className={styles.logoIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          </div>
          <span className={styles.logoText}>StaffHub</span>
        </Link>

        {selectedCompany && (
          <div className={styles.companyBadge}>
            <span className={styles.companyName}>{selectedCompany.name}</span>
            <span className={styles.separator}>•</span>
            <span className={`${styles.roleBadge} ${getRoleClass(userRole)}`}>
              {getRoleName(userRole)}
            </span>
          </div>
        )}
      </div>

      <div className={styles.navRight}>
        {user && (
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {getInitials(user)}
            </div>
            <div>
              <div className={styles.userName}>
                {user.firstName ? `${user.firstName} ${user.lastName}` : user.email}
              </div>
              {user.firstName && (
                <div className={styles.userEmail}>{user.email}</div>
              )}
            </div>
          </div>
        )}

        {selectedCompany && (
          <button className={styles.navBtn} onClick={handleChangeCompany}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Change Company</span>
          </button>
        )}

        <button className={`${styles.navBtn} ${styles.logoutBtn}`} onClick={handleLogout}>
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