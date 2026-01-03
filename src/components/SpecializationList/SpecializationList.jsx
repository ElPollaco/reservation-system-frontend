// src/components/SpecializationList/SpecializationList.jsx
import { useState, useEffect } from 'react';
import { specializationApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import styles from './SpecializationList.module.css';

const SpecializationList = () => {
  const { selectedCompany } = useAuth();
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSpec, setEditingSpec] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const companyId = selectedCompany?.id;

  const fetchSpecializations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await specializationApi.getAll(companyId);
      setSpecializations(response.data.items || response.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchSpecializations();
    }
  }, [companyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setError(null);
      const requestData = {
        name: formData.name,
        description: formData.description
      };

      if (editingSpec) {
        await specializationApi.update(companyId, editingSpec.id, requestData);
      } else {
        await specializationApi.create(companyId, requestData);
      }
      fetchSpecializations();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    }
  };

  const handleDelete = async (specId) => {
    if (window.confirm('Are you sure you want to delete this specialization?')) {
      try {
        await specializationApi.delete(companyId, specId);
        fetchSpecializations();
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
  };

  const handleEdit = (spec) => {
    setEditingSpec(spec);
    setFormData({
      name: spec.name,
      description: spec.description
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: ''
    });
    setEditingSpec(null);
    setShowForm(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <span>Loading specializations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>Specializations</h3>
          {specializations.length > 0 && (
            <span className={styles.specCount}>
              {specializations.length} {specializations.length === 1 ? 'specialization' : 'specializations'}
            </span>
          )}
        </div>
        <button
          className={`${styles.addBtn} ${showForm ? styles.addBtnCancel : ''}`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Cancel
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              Add Specialization
            </>
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className={styles.errorMessage}>
          <div className={styles.errorContent}>
            <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{error}</span>
          </div>
          <button className={styles.dismissBtn} onClick={() => setError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className={styles.formWrapper}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h4 className={styles.formTitle}>
              {editingSpec ? 'Edit Specialization' : 'Add New Specialization'}
            </h4>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="e.g., Yoga, Pilates, CrossFit"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Description <span className={styles.required}>*</span>
              </label>
              <textarea
                className={styles.formTextarea}
                placeholder="Describe this specialization..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {editingSpec ? 'Update Specialization' : 'Create Specialization'}
              </button>
              <button type="button" className={styles.cancelBtn} onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content */}
      {specializations.length > 0 ? (
        <div className={styles.specGrid}>
          {specializations.map((spec) => (
            <div key={spec.id} className={styles.specCard}>
              <div className={styles.specCardHeader}>
                <div className={styles.specIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                <div className={styles.specCardActions}>
                  <button
                    className={`${styles.specCardBtn} ${styles.specEditBtn}`}
                    onClick={() => handleEdit(spec)}
                    title="Edit"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                  </button>
                  <button
                    className={`${styles.specCardBtn} ${styles.specDeleteBtn}`}
                    onClick={() => handleDelete(spec.id)}
                    title="Delete"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                  </button>
                </div>
              </div>
              <h4 className={styles.specName}>{spec.name}</h4>
              <p className={styles.specDescription}>{spec.description}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
          </div>
          <h4 className={styles.emptyTitle}>No specializations yet</h4>
          <p className={styles.emptyMessage}>
            Create specializations to categorize your staff members' skills.
          </p>
          <button
            className={styles.emptyAction}
            onClick={() => setShowForm(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add First Specialization
          </button>
        </div>
      )}
    </div>
  );
};

export default SpecializationList;