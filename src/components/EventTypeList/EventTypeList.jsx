import {useState, useEffect, useCallback} from 'react';
import {useSearchParams} from 'react-router-dom';
import {eventTypeApi} from '../../services/api';
import {useAuth} from '../../context/AuthContext';
import ErrorModal from '../common/ErrorModal/ErrorModal.jsx';
import Pagination from '../common/Pagination/Pagination.jsx';
import styles from './EventTypeList.module.css';

const EventTypeList = () => {
  const {selectedCompany} = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [eventTypes, setEventTypes] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 11,
    totalCount: 0,
    totalPages: 1
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingType, setEditingType] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 0,
    maxParticipants: 11,
    minStaff: 1
  });

  const pageSize = 11;
  const currentPage = Math.max(0, parseInt(searchParams.get('page') || '1', 10) - 1);
  const companyId = selectedCompany?.id;

  const fetchEventTypes = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await eventTypeApi.getAll(companyId, {
        page: currentPage,
        pageSize: pageSize
      });

      const data = response.data;

      setEventTypes(data.items || []);
      setPagination({
        page: (data.page || 1) - 1,
        pageSize: data.pageSize || pageSize,
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 1
      });
    } catch (err) {
      console.error('Fetch error:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data || err.message);
      setEventTypes([]);
      setPagination({
        page: 0,
        pageSize: pageSize,
        totalCount: 0,
        totalPages: 1
      });
    } finally {
      setLoading(false);
    }
  }, [companyId, currentPage, pageSize]);

  const refreshEventTypes = async () => {
    if (!companyId) return;
    try {
      const response = await eventTypeApi.getAll(companyId, {
        page: currentPage,
        pageSize: pageSize
      });

      const data = response.data;
      setEventTypes(data.items || []);
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
      fetchEventTypes();
    }
  }, [fetchEventTypes]);

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams();
    if (newPage > 0) {
      newParams.set('page', String(newPage + 1));
    }
    setSearchParams(newParams, {replace: false});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestData = {
        name: formData.name,
        description: formData.description,
        duration: parseInt(formData.duration),
        price: parseFloat(formData.price),
        maxParticipants: parseInt(formData.maxParticipants),
        minStaff: parseInt(formData.minStaff)
      };

      if (editingType) {
        await eventTypeApi.update(companyId, editingType.id, requestData);
      } else {
        await eventTypeApi.create(companyId, requestData);
      }

      await refreshEventTypes();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || err.message);
    }
  };

  const handleDelete = async (typeId) => {
    if (window.confirm('Are you sure you want to delete this event type?')) {
      try {
        await eventTypeApi.delete(companyId, typeId);
        await refreshEventTypes();
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      }
    }
  };

  const handleEdit = (type) => {
    setEditingType(type);
    setFormData({
      name: type.name,
      description: type.description || '',
      duration: type.duration,
      price: type.price,
      maxParticipants: type.maxParticipants,
      minStaff: type.minStaff
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration: 60,
      price: 0,
      maxParticipants: 10,
      minStaff: 1
    });
    setEditingType(null);
    setShowForm(false);
  };

  if (loading && eventTypes.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <span>Loading event types...</span>
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
          <h3 className={styles.title}>Event Types</h3>
          {pagination.totalCount > 0 && (
            <span className={styles.typeCount}>
              {pagination.totalCount} {pagination.totalCount === 1 ? 'type' : 'types'}
            </span>
          )}
        </div>
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
              Add Event Type
            </>
          )}
        </button>
      </div>

      {showForm && (
        <div className={styles.formWrapper}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h4 className={styles.formTitle}>
              {editingType ? 'Edit Event Type' : 'Add New Event Type'}
            </h4>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Name <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Enter event type name"
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
                placeholder="Enter event type description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Duration (minutes) <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                  min="1"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Price <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Max Participants <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={formData.maxParticipants}
                  onChange={(e) => setFormData({...formData, maxParticipants: e.target.value})}
                  min="1"
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  Min Staff <span className={styles.required}>*</span>
                </label>
                <input
                  type="number"
                  className={styles.formInput}
                  value={formData.minStaff}
                  onChange={(e) => setFormData({...formData, minStaff: e.target.value})}
                  min="1"
                  required
                />
              </div>
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {editingType ? 'Update Event Type' : 'Create Event Type'}
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
          <div className={styles.contentArea}>
            {eventTypes.length > 0 ? (
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead className={styles.tableHeader}>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Duration</th>
                    <th>Price</th>
                    <th>Max Participants</th>
                    <th>Min Staff</th>
                    <th style={{textAlign: 'right'}}>Actions</th>
                  </tr>
                  </thead>
                  <tbody className={styles.tableBody}>
                  {eventTypes.map((type) => (
                    <tr key={type.id}>
                      <td className={styles.cellName}>{type.name}</td>
                      <td className={styles.cellDescription} title={type.description}>
                        {type.description}
                      </td>
                      <td>
                        <span className={styles.cellDuration}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                               strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          {type.duration} min
                        </span>
                      </td>
                      <td className={styles.cellPrice}>${type.price.toFixed(2)}</td>
                      <td>
                        <span className={styles.cellNumber}>{type.maxParticipants}</span>
                      </td>
                      <td>
                        <span className={styles.cellNumber}>{type.minStaff}</span>
                      </td>
                      <td>
                        <div className={styles.actionsCell}>
                          <button
                            className={`${styles.actionBtn} ${styles.editBtn}`}
                            onClick={() => handleEdit(type)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            Edit
                          </button>
                          <button
                            className={`${styles.actionBtn} ${styles.deleteBtn}`}
                            onClick={() => handleDelete(type.id)}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                 strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path
                                d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"></path>
                    <line x1="12" y1="8" x2="12" y2="16"></line>
                    <line x1="8" y1="12" x2="16" y2="12"></line>
                  </svg>
                </div>
                <h4 className={styles.emptyTitle}>No event types yet</h4>
                <p className={styles.emptyMessage}>
                  Get started by creating your first event type.
                </p>
                <button className={styles.emptyAction} onClick={() => setShowForm(true)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                  Add First Event Type
                </button>
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

export default EventTypeList;