import {useState, useEffect, useCallback} from 'react';
import {useSearchParams} from 'react-router-dom';
import {specializationApi} from '../../services/api';
import {useAuth} from '../../context/AuthContext';
import ErrorModal from "../common/ErrorModal/ErrorModal.jsx";
import SearchBar from "../common/SearchBar/SearchBar.jsx";
import Pagination from "../common/Pagination/Pagination.jsx";
import styles from './SpecializationList.module.css';

const SpecializationList = () => {
  const {selectedCompany, isTrainer} = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [specializations, setSpecializations] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 16,
    totalCount: 0,
    totalPages: 1
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSpec, setEditingSpec] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  const pageSize = 16;

  const searchQuery = searchParams.get('search') || '';
  const currentPage = Math.max(0, parseInt(searchParams.get('page') || '1', 10) - 1);

  const companyId = selectedCompany?.id;

  const fetchSpecializations = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await specializationApi.getAll(companyId, {
        page: currentPage,
        pageSize: pageSize,
        search: searchQuery
      });

      const data = response.data;

      setSpecializations(data.items || []);
      setPagination({
        page: (data.page || 1) - 1,
        pageSize: data.pageSize || pageSize,
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 1
      });
    } catch (err) {
      console.error('Fetch error:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data || err.message);
      setSpecializations([]);
      setPagination({
        page: 0,
        pageSize: pageSize,
        totalCount: 0,
        totalPages: 1
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, currentPage, pageSize, searchQuery]);

  const refreshSpecializations = async () => {
    if (!companyId) return;
    try {
      const response = await specializationApi.getAll(companyId, {
        page: currentPage,
        pageSize: pageSize,
        search: searchQuery
      });

      const data = response.data;
      setSpecializations(data.items || []);
      setPagination({
        page: (data.page || 1) - 1,
        pageSize: data.pageSize || pageSize,
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 1
      });
    } catch (err) {
      console.error('Failed to refresh:', err);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchSpecializations();
    }
  }, [fetchSpecializations]);

  const handleSearchChange = (value) => {
    const newParams = new URLSearchParams();
    if (value) {
      newParams.set('search', value);
    }
    setSearchParams(newParams, {replace: false});
  };

  const handleSearchClear = () => {
    setSearchParams({}, {replace: false});
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams();

    if (searchQuery)
      newParams.set('search', searchQuery);

    if (newPage > 0)
      newParams.set('page', String(newPage + 1));

    setSearchParams(newParams, {replace: false});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestData = {
        name: formData.name,
        description: formData.description
      };

      if (editingSpec) {
        await specializationApi.update(companyId, editingSpec.id, requestData);
      } else {
        await specializationApi.create(companyId, requestData);
      }

      await refreshSpecializations();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    }
  };

  const handleDelete = async (specId) => {
    if (window.confirm('Are you sure you want to delete this specialization?')) {
      try {
        await specializationApi.delete(companyId, specId);
        await refreshSpecializations();
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
  };

  const handleEdit = (spec) => {
    setEditingSpec(spec);
    setFormData({
      name: spec.name,
      description: spec.description || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({name: '', description: ''});
    setEditingSpec(null);
    setShowForm(false);
  };

  if (loading && specializations.length === 0) {
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
      <ErrorModal
        error={error}
        onClose={() => setError(null)}
      />

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>Specializations</h3>
          {pagination.totalCount > 0 && (
            <span className={styles.specCount}>
              {pagination.totalCount} {pagination.totalCount === 1 ? 'specialization' : 'specializations'}
              {searchQuery && ' found'}
            </span>
          )}
        </div>
        {!isTrainer() &&
          <button
          className={`${styles.addBtn} ${showForm ? styles.addBtnCancel : ''}`}
          onClick={() => showForm ? resetForm() : setShowForm(true)}
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
        }
      </div>

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
                onChange={(e) => setFormData({...formData, name: e.target.value})}
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
                onChange={(e) => setFormData({...formData, description: e.target.value})}
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

      {!showForm && (
        <>
          <SearchBar
            value={searchQuery}
            onChange={handleSearchChange}
            onClear={handleSearchClear}
            placeholder="Search by name or description..."
            loading={loading}
            resultCount={searchQuery ? pagination.totalCount : null}
            resultLabel="result"
          />

          <div className={styles.contentArea}>
            {specializations.length > 0 ? (
              <div className={styles.specGrid}>
                {specializations.map((spec) => (
                  <div key={spec.id} className={styles.specCard}>
                    <div className={styles.specCardHeader}>
                      <div className={styles.specIcon}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polygon
                            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                        </svg>
                      </div>
                      <div className={styles.specCardActions}>
                        {!isTrainer() && 
                          <>
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
                                <path
                                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                            </button>
                          </>
                        }
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
                    <polygon
                      points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                  </svg>
                </div>
                {searchQuery ? (
                  <>
                    <h4 className={styles.emptyTitle}>No results found</h4>
                    <p className={styles.emptyMessage}>
                      No specializations match "{searchQuery}". Try a different search term.
                    </p>
                    <button className={styles.emptyAction} onClick={handleSearchClear}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Clear Search
                    </button>
                  </>
                ) : (
                  <>
                    <h4 className={styles.emptyTitle}>No specializations yet</h4>
                    <p className={styles.emptyMessage}>
                      Create specializations to categorize your staff members' skills.
                    </p>
                    <button className={styles.emptyAction} onClick={() => setShowForm(true)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                      </svg>
                      Add First Specialization
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
};

export default SpecializationList;