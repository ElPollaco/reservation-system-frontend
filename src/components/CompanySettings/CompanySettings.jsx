// src/components/CompanySettings/CompanySettings.jsx
import { useState, useEffect } from 'react';
import { companyApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import styles from './CompanySettings.module.css';

const CompanySettings = () => {
  const { selectedCompany, selectCompany, userRole } = useAuth();
  const [companyData, setCompanyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingBreakTimes, setEditingBreakTimes] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    taxCode: '',
    street: '',
    city: '',
    postalCode: '',
    phone: '',
    email: ''
  });
  const [breakTimesData, setBreakTimesData] = useState({
    breakTimeStaff: 0,
    breakTimeParticipants: 0
  });

  const companyId = selectedCompany?.id;

  const fetchCompany = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await companyApi.getById(companyId);
      setCompanyData(response.data);
      setFormData({
        name: response.data.name || '',
        taxCode: response.data.taxCode || '',
        street: response.data.street || '',
        city: response.data.city || '',
        postalCode: response.data.postalCode || '',
        phone: response.data.phone || '',
        email: response.data.email || ''
      });
      setBreakTimesData({
        breakTimeStaff: response.data.breakTimeStaff || 0,
        breakTimeParticipants: response.data.breakTimeParticipants || 0
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchCompany();
    }
  }, [companyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await companyApi.update(companyId, formData);
      fetchCompany();
      setEditing(false);
      selectCompany({ ...selectedCompany, ...formData }, userRole);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    }
  };

  const handleBreakTimesSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      await companyApi.updateBreakTimes(companyId, {
        breakTimeStaff: parseInt(breakTimesData.breakTimeStaff),
        breakTimeParticipants: parseInt(breakTimesData.breakTimeParticipants)
      });
      fetchCompany();
      setEditingBreakTimes(false);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    }
  };

  const handleMarkAsReception = async () => {
    try {
      await companyApi.markAsReception(companyId);
      fetchCompany();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleUnmarkAsReception = async () => {
    try {
      await companyApi.unmarkAsReception(companyId);
      fetchCompany();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <span>Loading company settings...</span>
      </div>
    );
  }

  if (!companyData) {
    return (
      <div className={styles.loading}>
        <span>No company data found.</span>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Company Details Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderLeft}>
            <div className={styles.sectionIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <div>
              <h3 className={styles.sectionTitle}>Company Details</h3>
              <p className={styles.sectionSubtitle}>Manage your company information</p>
            </div>
          </div>
          {!editing && (
            <button className={styles.editBtn} onClick={() => setEditing(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit
            </button>
          )}
        </div>

        <div className={styles.sectionContent}>
          {error && (
            <div className={styles.errorMessage}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}

          {editing ? (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Company Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Enter company name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Tax Code <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Enter tax code"
                    value={formData.taxCode}
                    onChange={(e) => setFormData({ ...formData, taxCode: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Email <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    className={styles.formInput}
                    placeholder="company@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Street Address <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Enter street address"
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formRowAddress}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    City <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="Enter city"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Postal Code <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="text"
                    className={styles.formInput}
                    placeholder="00-000"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Phone <span className={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  className={styles.formInput}
                  placeholder="+48 000 000 000"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Save Changes
                </button>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditing(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Company Name</span>
                  <span className={styles.detailValue}>{companyData.name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Tax Code</span>
                  <span className={styles.detailValue}>{companyData.taxCode}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Email</span>
                  <span className={styles.detailValue}>{companyData.email}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Phone</span>
                  <span className={styles.detailValue}>{companyData.phone}</span>
                </div>
                <div className={styles.detailItemFull}>
                  <span className={styles.detailLabel}>Address</span>
                  <span className={styles.detailValue}>
                    {companyData.street}, {companyData.postalCode} {companyData.city}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Parent Node</span>
                  <span className={`${styles.statusBadge} ${companyData.isParentNode ? styles.statusBadgeYes : styles.statusBadgeNo}`}>
                    {companyData.isParentNode ? 'Yes' : 'No'}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Created</span>
                  <span className={`${styles.detailValue} ${styles.detailValueMuted}`}>
                    {formatDateTime(companyData.createdAt)}
                  </span>
                </div>
              </div>

              {/* Reception Toggle */}
              <div className={styles.receptionSection}>
                <div className={styles.receptionCard}>
                  <div className={styles.receptionInfo}>
                    <div className={`${styles.receptionIcon} ${companyData.isReception ? styles.receptionIconActive : styles.receptionIconInactive}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
                      </svg>
                    </div>
                    <div className={styles.receptionText}>
                      <h5>Reception Mode</h5>
                      <p>
                        {companyData.isReception
                          ? 'This company is marked as a reception point'
                          : 'Enable reception mode to use as a front desk'}
                      </p>
                    </div>
                  </div>
                  <button
                    className={`${styles.receptionBtn} ${companyData.isReception ? styles.receptionBtnDisable : styles.receptionBtnEnable}`}
                    onClick={companyData.isReception ? handleUnmarkAsReception : handleMarkAsReception}
                  >
                    {companyData.isReception ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Break Times Section */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionHeaderLeft}>
            <div className={`${styles.sectionIcon} ${styles.sectionIconWarning}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div>
              <h3 className={styles.sectionTitle}>Break Times</h3>
              <p className={styles.sectionSubtitle}>Configure break times between events</p>
            </div>
          </div>
          {!editingBreakTimes && (
            <button className={styles.editBtn} onClick={() => setEditingBreakTimes(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit
            </button>
          )}
        </div>

        <div className={styles.sectionContent}>
          {editingBreakTimes ? (
            <form onSubmit={handleBreakTimesSubmit} className={styles.form}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Break Time for Staff (minutes) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={breakTimesData.breakTimeStaff}
                    onChange={(e) => setBreakTimesData({ ...breakTimesData, breakTimeStaff: e.target.value })}
                    min="0"
                    required
                  />
                  <span className={styles.formHint}>
                    Minimum break time between events for staff members
                  </span>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Break Time for Participants (minutes) <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="number"
                    className={styles.formInput}
                    value={breakTimesData.breakTimeParticipants}
                    onChange={(e) => setBreakTimesData({ ...breakTimesData, breakTimeParticipants: e.target.value })}
                    min="0"
                    required
                  />
                  <span className={styles.formHint}>
                    Minimum break time between events for participants
                  </span>
                </div>
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  Save Break Times
                </button>
                <button type="button" className={styles.cancelBtn} onClick={() => setEditingBreakTimes(false)}>
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.breakTimesGrid}>
              <div className={styles.breakTimeCard}>
                <div className={styles.breakTimeIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                <div className={styles.breakTimeInfo}>
                  <p className={styles.breakTimeLabel}>Staff Break Time</p>
                  <p className={styles.breakTimeValue}>
                    {companyData.breakTimeStaff || 0} <span>minutes</span>
                  </p>
                </div>
              </div>
              <div className={styles.breakTimeCard}>
                <div className={styles.breakTimeIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="8.5" cy="7" r="4"></circle>
                  </svg>
                </div>
                <div className={styles.breakTimeInfo}>
                  <p className={styles.breakTimeLabel}>Participant Break Time</p>
                  <p className={styles.breakTimeValue}>
                    {companyData.breakTimeParticipants || 0} <span>minutes</span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanySettings;