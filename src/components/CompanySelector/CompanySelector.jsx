// src/components/CompanySelector/CompanySelector.jsx
import { useState } from 'react';
import { StaffRole, getRoleName } from '../../context/AuthContext';
import styles from './CompanySelector.module.css';

const CompanySelector = ({ companies, onSelect }) => {
  const [selectedId, setSelectedId] = useState(null);
  const [selectedRole, setSelectedRole] = useState(StaffRole.Manager);

  const handleSubmit = (e) => {
    e.preventDefault();
    const company = companies.find(c => c.id === selectedId);
    if (company) {
      console.log('Selecting company:', company, 'with role:', selectedRole);
      onSelect(company, selectedRole);
    }
  };

  const handleCardClick = (company) => {
    setSelectedId(company.id);
  };

  if (companies.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
        <h4 className={styles.emptyTitle}>No companies available</h4>
        <p className={styles.emptyMessage}>
          You are not assigned to any company. Please contact your administrator.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Choose Your Workspace</h2>
      <p className={styles.subtitle}>Select the company you want to work with</p>

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

        {/* Wybór roli */}
        <div className={styles.roleSelector}>
          <label htmlFor="role" className={styles.roleLabel}>
            Select your role:
          </label>
          <select
            id="role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(parseInt(e.target.value))}
            className={styles.roleSelect}
          >
            <option value={StaffRole.Manager}>{getRoleName(StaffRole.Manager)}</option>
            <option value={StaffRole.ReceptionEmployee}>{getRoleName(StaffRole.ReceptionEmployee)}</option>
            <option value={StaffRole.Trainer}>{getRoleName(StaffRole.Trainer)}</option>
          </select>
        </div>

        <button
          type="submit"
          className={styles.submitBtn}
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