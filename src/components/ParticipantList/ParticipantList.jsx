import {useState, useEffect, useCallback} from 'react';
import {useSearchParams} from 'react-router-dom';
import {participantApi} from '../../services/api';
import {useAuth} from '../../context/AuthContext';
import ErrorModal from '../common/ErrorModal/ErrorModal.jsx';
import SearchBar from '../common/SearchBar/SearchBar.jsx';
import Pagination from '../common/Pagination/Pagination.jsx';
import styles from './ParticipantList.module.css';

const ParticipantList = () => {
  const {selectedCompany, isTrainer} = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [participants, setParticipants] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 9,
    totalCount: 0,
    totalPages: 1
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gdprConsent: false
  });

  const pageSize = 9;

  const searchQuery = searchParams.get('search') || '';
  const currentPage = Math.max(0, parseInt(searchParams.get('page') || '1', 10) - 1);

  const companyId = selectedCompany?.id;

  const fetchParticipants = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await participantApi.getAll(companyId, {
        page: currentPage,
        pageSize: pageSize,
        search: searchQuery
      });

      const data = response.data;

      setParticipants(data.items || []);
      setPagination({
        page: (data.page || 1) - 1,
        pageSize: data.pageSize || pageSize,
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 1
      });
    } catch (err) {
      console.error('Fetch error:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data || err.message);
      setParticipants([]);
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

  const refreshParticipants = async () => {
    if (!companyId) return;
    try {
      const response = await participantApi.getAll(companyId, {
        page: currentPage + 1,
        pageSize: pageSize,
        search: searchQuery
      });

      const data = response.data;
      setParticipants(data.items || []);
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
      fetchParticipants();
    }
  }, [fetchParticipants]);

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
      if (editingParticipant) {
        await participantApi.update(companyId, editingParticipant.id, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone
        });
      } else {
        await participantApi.create(companyId, {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          gdprConsent: formData.gdprConsent
        });
      }
      await refreshParticipants();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    }
  };

  const handleDelete = async (participantId) => {
    if (window.confirm('Are you sure you want to delete this participant?')) {
      try {
        await participantApi.delete(companyId, participantId);
        await refreshParticipants();
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
  };

  const handleEdit = (participant) => {
    setEditingParticipant(participant);
    setFormData({
      firstName: participant.firstName,
      lastName: participant.lastName,
      email: participant.email,
      phone: participant.phone,
      gdprConsent: true
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      gdprConsent: false
    });
    setEditingParticipant(null);
    setShowForm(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return {date: '-', time: ''};
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (loading && participants.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <span>Loading participants...</span>
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
          <h3 className={styles.title}>Participants</h3>
          {pagination.totalCount > 0 && (
            <span className={styles.participantCount}>
              {pagination.totalCount} {pagination.totalCount === 1 ? 'person' : 'people'}
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
                  <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                  <circle cx="8.5" cy="7" r="4"></circle>
                  <line x1="20" y1="8" x2="20" y2="14"></line>
                  <line x1="23" y1="11" x2="17" y2="11"></line>
                </svg>
                Add Participant
              </>
            )}
          </button>
        }
      </div>

      {showForm && (
        <div className={styles.formWrapper}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h4 className={styles.formTitle}>
              {editingParticipant ? 'Edit Participant' : 'Add New Participant'}
            </h4>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  First Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Enter first name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  required
                  maxLength={40}
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Last Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="Enter last name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  required
                  maxLength={40}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Email <span className={styles.required}>*</span>
                </label>
                <input
                  type="email"
                  className={styles.formInput}
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Phone <span className={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  className={styles.formInput}
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  required
                />
              </div>
            </div>

            {!editingParticipant && (
              <div className={styles.checkboxGroup}>
                <input
                  type="checkbox"
                  id="gdprConsent"
                  className={styles.checkbox}
                  checked={formData.gdprConsent}
                  onChange={(e) => setFormData({...formData, gdprConsent: e.target.checked})}
                  required
                />
                <label htmlFor="gdprConsent" className={styles.checkboxLabel}>
                  <span className={styles.checkboxTitle}>
                    GDPR Consent <span className={styles.required}>*</span>
                  </span>
                  <span className={styles.checkboxDescription}>
                    I agree to the processing of my personal data in accordance with the GDPR regulations.
                  </span>
                </label>
              </div>
            )}

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {editingParticipant ? 'Update Participant' : 'Create Participant'}
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
            placeholder="Search by name, email, or phone..."
            loading={loading}
            resultCount={searchQuery ? pagination.totalCount : null}
            resultLabel="result"
          />

          <div className={styles.contentArea}>
            {participants.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    {!isTrainer() ? (
                      <>
                        <th>Created</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </>
                    ) : (
                      <th style={{ textAlign: 'right' }}>Created</th>
                    )}
                  </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                  {participants.map((participant) => {
                    const {date, time} = formatDate(participant.createdAt);
                    return (
                      <tr key={participant.id}>
                        <td>
                          <div className={styles.cellName}>
                            <div className={styles.avatar}>
                              {getInitials(participant.firstName, participant.lastName)}
                            </div>
                            <div className={styles.nameInfo}>
                                <span className={styles.fullName}>
                                  {participant.firstName} {participant.lastName}
                                </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className={styles.cellEmail}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2">
                              <path
                                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                              <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            {participant.email}
                          </div>
                        </td>
                        <td>
                          <div className={styles.cellPhone}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2">
                              <path
                                d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                            </svg>
                            {participant.phone}
                          </div>
                        </td>
                        {!isTrainer() ? (
                          <td>
                            <div className={styles.cellDate}>
                              <span className={styles.dateValue}>{date}</span>
                              <span className={styles.timeValue}>{time}</span>
                            </div>
                          </td>
                        ) : (
                          <td style={{textAlign: 'right'}}>
                            <div className={styles.cellDate}>
                              <span className={styles.dateValue}>{date}</span>
                              <span className={styles.timeValue}>{time}</span>
                            </div>
                          </td>
                        )}
                        {!isTrainer() &&
                          <td>
                          <div className={styles.actionsCell}>
                            <button
                              className={`${styles.actionBtn} ${styles.editBtn}`}
                              onClick={() => handleEdit(participant)}
                              title="Edit participant"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                   strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                              </svg>
                              <span>Edit</span>
                            </button>
                            <button
                              className={`${styles.actionBtn} ${styles.deleteBtn}`}
                              onClick={() => handleDelete(participant.id)}
                              title="Delete participant"
                            >
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                   strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path
                                  d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                              </svg>
                              <span>Delete</span>
                            </button>
                          </div>
                        </td>}
                      </tr>
                    );
                  })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </div>
                {searchQuery ? (
                  <>
                    <h4 className={styles.emptyTitle}>No results found</h4>
                    <p className={styles.emptyMessage}>
                      No participants match "{searchQuery}". Try a different search term.
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
                    <h4 className={styles.emptyTitle}>No participants yet</h4>
                    <p className={styles.emptyMessage}>
                      Get started by adding your first participant to the system.
                    </p>
                    <button className={styles.emptyAction} onClick={() => setShowForm(true)}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="8.5" cy="7" r="4"></circle>
                        <line x1="20" y1="8" x2="20" y2="14"></line>
                        <line x1="23" y1="11" x2="17" y2="11"></line>
                      </svg>
                      Add First Participant
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

export default ParticipantList;