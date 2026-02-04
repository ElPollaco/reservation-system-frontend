// NIE WIEM CZEMU POMIMO KODU 200, NIE WYŚIWETLAJĄ MI SIĘ GODZINY DOSTĘPNOŚCI PO POŚCIE

import { useEffect, useState, useCallback } from 'react';
import { staffMemberApi } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import TrainerAvailabilityModal from './components/Modal/TrainerAvailabilityModal.jsx';
import ErrorModal from "../common/ErrorModal/ErrorModal.jsx";
import SearchBar from "../common/SearchBar/SearchBar.jsx";
import Pagination from "../common/Pagination/Pagination.jsx";
import styles from './TrainerAvailability.module.css';

const TrainerAvailability = () => {
  const { selectedCompany, staffMember, } = useAuth();
  const companyId = selectedCompany?.id;
  const staffMemberId = staffMember?.id;

  const [availability, setAvailability] = useState([]);
  const [eventSchedules, setEventSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({ 
    page: 0,
    pageSize: 16,
    totalCount: 0,
    totalPages: 1
  });

  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [modalType, setModalType] = useState('availability');

  const pageSize = 16;

  const buildPayload = (data) => {
    const start = new Date(`${data.date}T${data.startTime}`);
    const end = new Date(`${data.date}T${data.endTime}`);
    return {
        date: data.date,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        isAvailable: data.isAvailable,
        note: data.note || "Available"
    };
  };

  const fetchData = useCallback(async (page = pagination.page) => {
    if (!companyId || !staffMemberId) return;

    setLoading(true);
    setError(null);
    try {
        const [availabilityRes, schedulesRes] = await Promise.all([
            staffMemberApi.getAvailability(companyId, staffMemberId, { search: searchQuery, page: page + 1, pageSize }),
            staffMemberApi.getEventSchedules(companyId, staffMemberId)
        ]);

        setAvailability(availabilityRes.data.items || []);
        setEventSchedules(schedulesRes.data?.items || schedulesRes.data || []);
        setPagination({
            page: (availabilityRes.data.page || 1) - 1,
            pageSize: availabilityRes.data.pageSize || pageSize,
            totalCount: availabilityRes.data.totalCount || 0,
            totalPages: availabilityRes.data.totalPages || 1
        });
    } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message);
    } finally {
        setLoading(false);
    }
    }, [companyId, staffMemberId, searchQuery, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
  };

  const handleAddAvailability = () => {
    setEditingItem(null);
    setModalType('availability');
    setShowModal(true);
  };

  const handleEditAvailability = (item) => {
    setEditingItem(item);
    setModalType('availability');
    setShowModal(true);
  };

  const handleDeleteAvailability = async (id) => {
    if (!window.confirm('Delete this availability slot?')) return;
    try {
      await staffMemberApi.removeAvailability(companyId, id);
      fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleSaveModal = async (formData) => {
    try {
        const payload = buildPayload(formData);

        if (editingItem) {
            await staffMemberApi.updateAvailability(companyId, editingItem.id, payload);
        } else {
            await staffMemberApi.addAvailability(companyId, staffMemberId, payload);
            setPagination(prev => ({ ...prev, page: 0 }));
        }

        setShowModal(false);
        fetchData();
    } catch (err) {
        console.error(err);
        setError(err.response?.data?.message || err.message);
    }
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handleSearchClear = () => {
    setSearchQuery('');
    setPagination(prev => ({ ...prev, page: 0 }));
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className={styles.container}>
      <ErrorModal error={error} onClose={() => setError(null)} />

      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>Trainer Availability</h3>
          {pagination.totalCount > 0 && (
            <span className={styles.specCount}>
              {pagination.totalCount} {pagination.totalCount === 1 ? 'slot' : 'slots'}
              {searchQuery && ' found'}
            </span>
          )}
        </div>
        <button className={styles.addBtn} onClick={handleAddAvailability}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            Add Availability
        </button>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={handleSearchChange}
        onClear={handleSearchClear}
        placeholder="Search availability..."
        loading={loading}
        resultCount={searchQuery ? pagination.totalCount : null}
        resultLabel="result"
      />

      {loading ? (
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <span>Loading availability...</span>
        </div>
      ) : (
        <>
          {availability.length === 0 ? (
            <div className={styles.emptyState}>
              <h4 className={styles.emptyTitle}>No availability set</h4>
              <p className={styles.emptyMessage}>Add your available hours so clients can book sessions.</p>
              <button className={styles.emptyAction} onClick={handleAddAvailability}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add Availability
              </button>
            </div>
          ) : (
            <div className={styles.specGrid}>
              {availability.map((a) => (
                <div key={a.id} className={styles.specCard}>
                  <div className={styles.specCardHeader}>
                    <div className={styles.specIcon}>🕒</div>
                    <div className={styles.specCardActions}>
                      <button className={`${styles.specCardBtn} ${styles.specEditBtn}`} onClick={() => handleEditAvailability(a)}>✏️</button>
                      <button className={`${styles.specCardBtn} ${styles.specDeleteBtn}`} onClick={() => handleDeleteAvailability(a.id)}>🗑️</button>
                    </div>
                  </div>
                  <h4 className={styles.specName}>{formatDateTime(a.startTime)} - {formatDateTime(a.endTime)}</h4>
                  <p className={styles.specDescription}>{a.note || 'Available'}</p>
                </div>
              ))}
            </div>
          )}

          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.pageSize}
            onPageChange={handlePageChange}
          />
        </>
      )}

      <TrainerAvailabilityModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onSave={async (data) => {
            try {
            const payload = buildPayload(data);

            if (editingItem) {
                await staffMemberApi.updateAvailability(companyId, editingItem.id, payload);
            } else {
                await staffMemberApi.addAvailability(companyId, staffMemberId, payload);

                setShowModal(false);
                fetchData(0);
                return;
            }

            setShowModal(false);
            fetchData(pagination.page);
            } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message);
            }
        }}
        onDelete={async (id) => {
            if (!window.confirm('Delete this availability?')) return;
            try {
            await staffMemberApi.removeAvailability(companyId, id);
            fetchData();
            setShowModal(false);
            } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || err.message);
            }
        }}
        initialData={editingItem || {}}
        type={modalType}
      />
    </div>
  );
};

export default TrainerAvailability;
