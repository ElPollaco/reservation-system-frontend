import {useState} from 'react';
import styles from './CompanySelector.module.css';
import RoleBadge from "../ui/RoleBadge/RoleBadge.jsx";

const CompanySelector = ({companies, staffMember, onSelect}) => {
  const [selectedId, setSelectedId] = useState(null);
  const handleSubmit = (e) => {
    e.preventDefault();
    const company = companies.find(c => c.id === selectedId);
    if (company) {
      console.log('Selecting company:', company);
      onSelect(company);
    }
  };

  const handleCardClick = (company) => {
    setSelectedId(company.id);
  };

  if (companies.length === 0) {
    return (
      <div className="emptyState">
        <div className="emptyIcon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <h4 className="emptyTitle">No companies available</h4>
        <p className="emptyMessage">
          Welcome, {staffMember.firstName} {staffMember.lastName}
          <br/>
          You are not assigned to any company yet. Please contact your administrator to get access
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Choose Your Workspace</h2>
      <p className={styles.subtitle}>
        Welcome, {staffMember.firstName} {staffMember.lastName}
        <br/>
        Select the company you want to work with
      </p>
      <div className={styles.roleInfo}>
        <span className={styles.roleLabel}>Your role:</span>
        <RoleBadge role={staffMember.role}/>
      </div>
      <form onSubmit={handleSubmit}>
        <div className={styles.companyList}>
          {companies.map((company) => (
            <div
              key={company.id}
              className={`${styles.companyCard} ${selectedId === company.id ? styles.companyCardSelected : ''}`}
              onClick={() => handleCardClick(company)}
            >
              <div className={styles.companyIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                  <polyline points="9 22 9 12 15 12 15 22"></polyline>
                </svg>
              </div>
              <div className={styles.companyInfo}>
                <h3 className={styles.companyName}>{company.name}</h3>
                {company.city && (
                  <p className={styles.companyLocation}>{company.city}, {company.street}</p>
                )}
              </div>
              <div className={styles.checkIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
          ))}
        </div>
        <button
          type="submit"
          className="submitBtn"
          disabled={selectedId === null}
        >
          Continue to Dashboard
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default CompanySelector;