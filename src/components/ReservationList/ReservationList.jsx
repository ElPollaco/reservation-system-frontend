import {useState, useEffect, useCallback} from 'react';
import {useSearchParams} from 'react-router-dom';
import {reservationApi, eventScheduleApi, participantApi, eventTypeApi} from '../../services/api';
import {useAuth} from '../../context/AuthContext';
import ErrorModal from '../common/ErrorModal/ErrorModal';
import Pagination from '../common/Pagination/Pagination';
import ReservationHeader from './components/ReservationHeader/ReservationHeader';
import ReservationForm from './components/ReservationForm/ReservationForm';
import ReservationTable from './components/ReservationTable/ReservationTable';
import styles from './ReservationList.module.css';

const ReservationList = () => {
  const {selectedCompany} = useAuth();
  const companyId = selectedCompany?.id;
  const [searchParams, setSearchParams] = useSearchParams();

  const [reservations, setReservations] = useState([]);
  const [eventSchedules, setEventSchedules] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 9,
    totalCount: 0,
    totalPages: 1
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  const pageSize = 9;

  const currentPage = Math.max(0, parseInt(searchParams.get('page') || '1', 10) - 1);

  const fetchReservations = useCallback(async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await reservationApi.getAll(companyId, {
        page: currentPage,
        pageSize: pageSize
      });

      const data = response.data;

      setReservations(data.items || []);
      setPagination({
        page: (data.page || 1) - 1,
        pageSize: data.pageSize || pageSize,
        totalCount: data.totalCount || 0,
        totalPages: data.totalPages || 1
      });
    } catch (err) {
      console.error('Fetch error:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data || err.message);
      setReservations([]);
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

  const fetchSupportingData = useCallback(async () => {
    if (!companyId) return;

    try {
      const [schedulesRes, participantsRes, eventTypesRes] = await Promise.all([
        eventScheduleApi.getAll(companyId, {page: 0, pageSize: 500}),
        participantApi.getAll(companyId, {page: 0, pageSize: 500}),
        eventTypeApi.getAll(companyId)
      ]);

      setEventSchedules(schedulesRes.data.items || schedulesRes.data || []);
      setParticipants(participantsRes.data.items || participantsRes.data || []);
      setEventTypes(eventTypesRes.data.items || eventTypesRes.data || []);
    } catch (err) {
      console.error('Failed to fetch supporting data:', err);
    }
  }, [companyId]);

  const refreshReservations = async () => {
    if (!companyId) return;

    try {
      const response = await reservationApi.getAll(companyId, {
        page: currentPage,
        pageSize: pageSize
      });

      const data = response.data;

      setReservations(data.items || []);
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

  const refreshParticipants = async () => {
    if (!companyId) return;

    try {
      const participantsRes = await participantApi.getAll(companyId, {page: 0, pageSize: 500});
      setParticipants(participantsRes.data.items || participantsRes.data || []);
    } catch (err) {
      console.error('Failed to refresh participants:', err);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchReservations();
      fetchSupportingData();
    }
  }, [fetchReservations, fetchSupportingData]);

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams();
    if (newPage > 0) {
      newParams.set('page', String(newPage + 1));
    }
    setSearchParams(newParams, {replace: false});
  };

  const handleSubmit = async (formData) => {
    try {
      setError(null);
      if (editingReservation) {
        await reservationApi.update(companyId, editingReservation.id, {
          notes: formData.notes
        });
      } else {
        await reservationApi.create(companyId, {
          eventScheduleId: formData.eventScheduleId,
          participantsIds: formData.participantsIds,
          notes: formData.notes,
          isPaid: formData.isPaid
        });
      }
      handleCloseForm();
      await refreshReservations();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      throw err;
    }
  };

  const handleDelete = async (reservationId) => {
    if (!window.confirm('Are you sure you want to delete this reservation?')) return;

    // Optimistic update
    const previousReservations = [...reservations];
    setReservations(prev => prev.filter(r => r.id !== reservationId));

    try {
      await reservationApi.delete(companyId, reservationId);
      await refreshReservations();
    } catch (err) {
      setReservations(previousReservations);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleMarkAsPaid = async (reservationId) => {
    const previousReservations = [...reservations];
    setReservations(prev => prev.map(r =>
      r.id === reservationId
        ? {...r, isPaid: true, paidAt: new Date().toISOString()}
        : r
    ));

    try {
      await reservationApi.markAsPaid(companyId, reservationId);
      await refreshReservations();
    } catch (err) {
      setReservations(previousReservations);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleUnmarkAsPaid = async (reservationId) => {
    const previousReservations = [...reservations];
    setReservations(prev => prev.map(r =>
      r.id === reservationId
        ? {...r, isPaid: false, paidAt: null}
        : r
    ));

    try {
      await reservationApi.unmarkAsPaid(companyId, reservationId);
      await refreshReservations();
    } catch (err) {
      setReservations(previousReservations);
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingReservation(null);
  };

  const handleAddParticipant = async (participantData) => {
    try {
      const response = await participantApi.create(companyId, participantData);
      await refreshParticipants();
      return response.data.id || response.data;
    } catch (err) {
      throw err;
    }
  };

  if (loading && reservations.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner}></div>
          <span>Loading reservations...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <ErrorModal error={error} onClose={() => setError(null)}/>

      <ReservationHeader
        totalCount={pagination.totalCount}
        showForm={showForm}
        onToggleForm={() => showForm ? handleCloseForm() : setShowForm(true)}
      />

      {showForm && (
        <ReservationForm
          editingReservation={editingReservation}
          eventSchedules={eventSchedules}
          participants={participants}
          eventTypes={eventTypes}
          onSubmit={handleSubmit}
          onCancel={handleCloseForm}
          onAddParticipant={handleAddParticipant}
        />
      )}

      {!showForm && (
        <>
          <ReservationTable
            reservations={reservations}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onMarkAsPaid={handleMarkAsPaid}
            onUnmarkAsPaid={handleUnmarkAsPaid}
            loading={loading}
            onShowForm={() => setShowForm(true)}
          />

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

export default ReservationList;