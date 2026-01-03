// src/components/ReservationList/ReservationList.jsx
import { useState, useEffect, useMemo } from 'react';
import { reservationApi, eventScheduleApi, participantApi } from '../../api/api';
import { useAuth } from '../../context/AuthContext';
import styles from './ReservationList.module.css';

const ReservationList = () => {
  const { selectedCompany } = useAuth();
  const [reservations, setReservations] = useState([]);
  const [eventSchedules, setEventSchedules] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingReservation, setEditingReservation] = useState(null);

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Participant search & modal
  const [participantSearch, setParticipantSearch] = useState('');
  const [showNewParticipantModal, setShowNewParticipantModal] = useState(false);
  const [newParticipantData, setNewParticipantData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gdprConsent: false
  });
  const [creatingParticipant, setCreatingParticipant] = useState(false);

  const [formData, setFormData] = useState({
    eventScheduleId: '',
    participantsIds: [],
    notes: '',
    isPaid: false
  });

  const companyId = selectedCompany?.id;

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = {};
    eventSchedules.forEach(schedule => {
      if (!schedule.startTime) return;
      const dateKey = new Date(schedule.startTime).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(schedule);
    });

    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    });

    return grouped;
  }, [eventSchedules]);

  // Get selected event
  const selectedEvent = useMemo(() => {
    return eventSchedules.find(s => s.id === formData.eventScheduleId);
  }, [formData.eventScheduleId, eventSchedules]);

  // Filter participants by search
  const filteredParticipants = useMemo(() => {
    if (!participantSearch.trim()) return participants;
    const search = participantSearch.toLowerCase();
    return participants.filter(p =>
      p.firstName?.toLowerCase().includes(search) ||
      p.lastName?.toLowerCase().includes(search) ||
      p.email?.toLowerCase().includes(search) ||
      p.phone?.includes(search)
    );
  }, [participants, participantSearch]);

  // Get selected participants details
  const selectedParticipantsDetails = useMemo(() => {
    return participants.filter(p => formData.participantsIds.includes(p.id));
  }, [participants, formData.participantsIds]);

  // Initial data fetch (with loading spinner)
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [reservationsRes, schedulesRes, participantsRes] = await Promise.all([
        reservationApi.getAll(companyId),
        eventScheduleApi.getAll(companyId),
        participantApi.getAll(companyId)
      ]);

      setReservations(reservationsRes.data.items || reservationsRes.data || []);
      setEventSchedules(schedulesRes.data.items || schedulesRes.data || []);
      setParticipants(participantsRes.data.items || participantsRes.data || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Silent refresh (without loading spinner) - for updates
  const refreshReservations = async () => {
    try {
      const response = await reservationApi.getAll(companyId);
      setReservations(response.data.items || response.data || []);
    } catch (err) {
      console.error('Failed to refresh reservations:', err);
    }
  };

  useEffect(() => {
    if (companyId) {
      fetchData();
    }
  }, [companyId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!editingReservation && !formData.eventScheduleId) {
      setError('Please select an event');
      return;
    }

    if (!editingReservation && formData.participantsIds.length === 0) {
      setError('Please select at least one participant');
      return;
    }

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
      await refreshReservations();
      resetForm();
    } catch (err) {
      console.error('Reservation error:', err.response?.data);
      setError(err.response?.data?.message || err.response?.data || err.message);
    }
  };

  const handleCreateParticipant = async (e) => {
    e.preventDefault();
    try {
      setCreatingParticipant(true);
      setError(null);

      const response = await participantApi.create(companyId, {
        firstName: newParticipantData.firstName,
        lastName: newParticipantData.lastName,
        email: newParticipantData.email,
        phone: newParticipantData.phone,
        gdprConsent: newParticipantData.gdprConsent
      });

      // Refresh participants list
      const participantsRes = await participantApi.getAll(companyId);
      setParticipants(participantsRes.data.items || participantsRes.data || []);

      // Auto-select the new participant
      const newParticipantId = response.data.id || response.data;
      if (newParticipantId) {
        setFormData(prev => ({
          ...prev,
          participantsIds: [...prev.participantsIds, newParticipantId]
        }));
      }

      // Reset modal
      setShowNewParticipantModal(false);
      setNewParticipantData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        gdprConsent: false
      });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setCreatingParticipant(false);
    }
  };

  const handleDelete = async (reservationId) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        // Optimistic update - remove from list immediately
        setReservations(prev => prev.filter(r => r.id !== reservationId));

        await reservationApi.delete(companyId, reservationId);
      } catch (err) {
        // Revert on error
        await refreshReservations();
        setError(err.response?.data?.message || err.message);
      }
    }
  };

  const handleMarkAsPaid = async (reservationId) => {
    try {
      // Optimistic update - update state immediately
      setReservations(prev => prev.map(r =>
        r.id === reservationId
          ? { ...r, isPaid: true, paidAt: new Date().toISOString() }
          : r
      ));

      await reservationApi.markAsPaid(companyId, reservationId);

      // Silent refresh to get accurate data from server
      await refreshReservations();
    } catch (err) {
      // Revert on error
      setReservations(prev => prev.map(r =>
        r.id === reservationId
          ? { ...r, isPaid: false, paidAt: null }
          : r
      ));
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleUnmarkAsPaid = async (reservationId) => {
    try {
      // Optimistic update - update state immediately
      setReservations(prev => prev.map(r =>
        r.id === reservationId
          ? { ...r, isPaid: false, paidAt: null }
          : r
      ));

      await reservationApi.unmarkAsPaid(companyId, reservationId);

      // Silent refresh to get accurate data from server
      await refreshReservations();
    } catch (err) {
      // Revert on error
      setReservations(prev => prev.map(r =>
        r.id === reservationId
          ? { ...r, isPaid: true }
          : r
      ));
      setError(err.response?.data?.message || err.message);
    }
  };

  const handleEdit = (reservation) => {
    setEditingReservation(reservation);
    setFormData({
      eventScheduleId: reservation.eventSchedule?.id || '',
      participantsIds: reservation.participants?.map(p => p.id) || [],
      notes: reservation.notes || '',
      isPaid: reservation.isPaid
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      eventScheduleId: '',
      participantsIds: [],
      notes: '',
      isPaid: false
    });
    setEditingReservation(null);
    setShowForm(false);
    setParticipantSearch('');
  };

  const handleParticipantToggle = (participantId) => {
    setFormData(prev => ({
      ...prev,
      participantsIds: prev.participantsIds.includes(participantId)
        ? prev.participantsIds.filter(id => id !== participantId)
        : [...prev.participantsIds, participantId]
    }));
  };

  const handleEventSelect = (scheduleId) => {
    setFormData(prev => ({
      ...prev,
      eventScheduleId: prev.eventScheduleId === scheduleId ? '' : scheduleId
    }));
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return { date: '-', time: '' };
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return styles.statusConfirmed;
      case 'pending': return styles.statusPending;
      case 'cancelled': return styles.statusCancelled;
      default: return styles.statusPending;
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    const prevMonth = new Date(year, month, 0);
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const getEventsForDate = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    return eventsByDate[dateKey] || [];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isEventSelected = (scheduleId) => {
    return formData.eventScheduleId === scheduleId;
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = getDaysInMonth(calendarDate);

  if (loading) {
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
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h3 className={styles.title}>Reservations</h3>
          {reservations.length > 0 && (
            <span className={styles.reservationCount}>
              {reservations.length} {reservations.length === 1 ? 'reservation' : 'reservations'}
            </span>
          )}
        </div>
        <button
          className={`${styles.addBtn} ${showForm ? styles.addBtnCancel : ''}`}
          onClick={() => {
            if (showForm) {
              resetForm();
            } else {
              setShowForm(true);
            }
          }}
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
              Add Reservation
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
            <span>{typeof error === 'object' ? JSON.stringify(error) : error}</span>
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
              {editingReservation ? 'Edit Reservation' : 'Create New Reservation'}
            </h4>

            {!editingReservation && (
              <>
                {/* Compact Event Calendar */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Select Event <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.eventCalendarSection}>
                    <div className={styles.calendarHeader}>
                      <span className={styles.calendarTitle}>
                        {calendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                      <div className={styles.calendarNav}>
                        <button
                          type="button"
                          className={styles.calendarNavBtn}
                          onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="15 18 9 12 15 6"></polyline>
                          </svg>
                        </button>
                        <button
                          type="button"
                          className={styles.calendarNavBtn}
                          onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <div className={styles.compactCalendar}>
                      {weekDays.map(day => (
                        <div key={day} className={styles.weekDayHeader}>{day}</div>
                      ))}

                      {calendarDays.map((day, index) => {
                        const dayEvents = getEventsForDate(day.date);
                        const hasSelectedEvent = dayEvents.some(e => e.id === formData.eventScheduleId);

                        return (
                          <div
                            key={index}
                            className={`
                              ${styles.calendarCell}
                              ${!day.isCurrentMonth ? styles.calendarCellOther : ''}
                              ${isToday(day.date) ? styles.calendarCellToday : ''}
                              ${hasSelectedEvent ? styles.calendarCellSelected : ''}
                            `}
                          >
                            <span className={styles.dayNumber}>{day.date.getDate()}</span>
                            <div className={styles.dayEvents}>
                              {dayEvents.slice(0, 2).map(event => (
                                <div
                                  key={event.id}
                                  className={`${styles.dayEventPill} ${isEventSelected(event.id) ? styles.dayEventPillSelected : ''}`}
                                  onClick={() => handleEventSelect(event.id)}
                                  title={`${event.eventType?.name || 'Event'} - ${formatTime(event.startTime)}`}
                                >
                                  {formatTime(event.startTime)} {event.eventType?.name?.substring(0, 8) || ''}
                                </div>
                              ))}
                              {dayEvents.length > 2 && (
                                <span className={styles.moreEventsIndicator}>+{dayEvents.length - 2} more</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedEvent && (
                      <div className={styles.selectedEventBanner}>
                        <div className={styles.selectedEventIcon}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                        <div className={styles.selectedEventInfo}>
                          <div className={styles.selectedEventLabel}>Selected Event</div>
                          <div className={styles.selectedEventName}>
                            {selectedEvent.eventType?.name || 'Event'}
                          </div>
                          <div className={styles.selectedEventDetails}>
                            {selectedEvent.placeName} • {formatDateTime(selectedEvent.startTime).date} at {formatTime(selectedEvent.startTime)}
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.clearEventBtn}
                          onClick={() => setFormData(prev => ({ ...prev, eventScheduleId: '' }))}
                        >
                          Clear
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Participants Section */}
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Participants <span className={styles.required}>*</span>
                  </label>
                  <div className={styles.participantsSection}>
                    <div className={styles.participantsHeader}>
                      <div className={styles.participantsTitle}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                          <circle cx="9" cy="7" r="4"></circle>
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        Select Participants
                        {formData.participantsIds.length > 0 && (
                          <span className={styles.selectedBadge}>{formData.participantsIds.length}</span>
                        )}
                      </div>
                      <button
                        type="button"
                        className={styles.addNewParticipantBtn}
                        onClick={() => setShowNewParticipantModal(true)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="5" x2="12" y2="19"></line>
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        New
                      </button>
                    </div>

                    <div className={styles.searchBox}>
                      <input
                        type="text"
                        className={styles.searchInput}
                        placeholder="Search by name, email or phone..."
                        value={participantSearch}
                        onChange={(e) => setParticipantSearch(e.target.value)}
                      />
                    </div>

                    <div className={styles.participantsList}>
                      {filteredParticipants.length > 0 ? (
                        filteredParticipants.map(participant => (
                          <div
                            key={participant.id}
                            className={`${styles.participantItem} ${formData.participantsIds.includes(participant.id) ? styles.participantItemSelected : ''}`}
                            onClick={() => handleParticipantToggle(participant.id)}
                          >
                            <div className={styles.participantCheckbox}>
                              {formData.participantsIds.includes(participant.id) && (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              )}
                            </div>
                            <div className={styles.participantAvatar}>
                              {getInitials(participant.firstName, participant.lastName)}
                            </div>
                            <div className={styles.participantInfo}>
                              <div className={styles.participantName}>
                                {participant.firstName} {participant.lastName}
                              </div>
                              <div className={styles.participantEmail}>{participant.email}</div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className={styles.noResults}>
                          {participantSearch ? 'No participants found' : 'No participants available'}
                        </div>
                      )}
                    </div>

                    {selectedParticipantsDetails.length > 0 && (
                      <div className={styles.selectedParticipants}>
                        {selectedParticipantsDetails.map(p => (
                          <span key={p.id} className={styles.participantTag}>
                            <span className={styles.participantTagAvatar}>
                              {getInitials(p.firstName, p.lastName)}
                            </span>
                            {p.firstName} {p.lastName}
                            <button
                              type="button"
                              className={styles.participantTagRemove}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleParticipantToggle(p.id);
                              }}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <label className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={formData.isPaid}
                    onChange={(e) => setFormData({ ...formData, isPaid: e.target.checked })}
                  />
                  <span className={styles.checkboxLabel}>Mark as Paid</span>
                </label>
              </>
            )}

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Notes</label>
              <textarea
                className={styles.formTextarea}
                placeholder="Add any notes about this reservation..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>

            <div className={styles.formActions}>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={!editingReservation && (!formData.eventScheduleId || formData.participantsIds.length === 0)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {editingReservation ? 'Update' : 'Create Reservation'}
              </button>
              <button type="button" className={styles.cancelBtn} onClick={resetForm}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* New Participant Modal */}
      {showNewParticipantModal && (
        <div className={styles.modalOverlay} onClick={() => setShowNewParticipantModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h4 className={styles.modalTitle}>Add New Participant</h4>
              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={() => setShowNewParticipantModal(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleCreateParticipant} className={styles.modalForm}>
                <div className={styles.modalFormRow}>
                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>
                      First Name <span className={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      className={styles.formInput}
                      placeholder="First name"
                      value={newParticipantData.firstName}
                      onChange={(e) => setNewParticipantData(prev => ({ ...prev, firstName: e.target.value }))}
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
                      placeholder="Last name"
                      value={newParticipantData.lastName}
                      onChange={(e) => setNewParticipantData(prev => ({ ...prev, lastName: e.target.value }))}
                      required
                      maxLength={40}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Email <span className={styles.required}>*</span>
                  </label>
                  <input
                    type="email"
                    className={styles.formInput}
                    placeholder="email@example.com"
                    value={newParticipantData.email}
                    onChange={(e) => setNewParticipantData(prev => ({ ...prev, email: e.target.value }))}
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
                    placeholder="+48 000 000 000"
                    value={newParticipantData.phone}
                    onChange={(e) => setNewParticipantData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                  />
                </div>

                <label className={styles.checkboxGroup}>
                  <input
                    type="checkbox"
                    className={styles.checkbox}
                    checked={newParticipantData.gdprConsent}
                    onChange={(e) => setNewParticipantData(prev => ({ ...prev, gdprConsent: e.target.checked }))}
                    required
                  />
                  <span className={styles.checkboxLabel}>
                    GDPR Consent <span className={styles.required}>*</span>
                  </span>
                </label>

                <div className={styles.modalActions}>
                  <button
                    type="submit"
                    className={styles.submitBtn}
                    disabled={creatingParticipant}
                  >
                    {creatingParticipant ? 'Creating...' : 'Create & Select'}
                  </button>
                  <button
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setShowNewParticipantModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {reservations.length > 0 ? (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead className={styles.tableHeader}>
            <tr>
              <th>Event</th>
              <th>Participants</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Notes</th>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
            </thead>
            <tbody className={styles.tableBody}>
            {reservations.map((reservation) => {
              const eventDateTime = formatDateTime(reservation.eventSchedule?.startTime);
              const createdAt = formatDateTime(reservation.createdAt);

              return (
                <tr key={reservation.id}>
                  <td>
                    <div className={styles.cellEvent}>
                        <span className={styles.eventName}>
                          {reservation.eventSchedule?.eventType?.name || 'N/A'}
                        </span>
                      <div className={styles.eventDetails}>
                          <span className={styles.eventPlace}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                              <circle cx="12" cy="10" r="3"></circle>
                            </svg>
                            {reservation.eventSchedule?.placeName}
                          </span>
                        <span className={styles.eventTime}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                          {eventDateTime.date} {eventDateTime.time}
                          </span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={styles.cellParticipants}>
                      {reservation.participants?.map(p => (
                        <span key={p.id} className={styles.cellParticipantTag}>
                            <span className={styles.cellParticipantAvatar}>
                              {getInitials(p.firstName, p.lastName)}
                            </span>
                          {p.firstName} {p.lastName}
                          </span>
                      )) || '-'}
                    </div>
                  </td>
                  <td>
                      <span className={`${styles.statusBadge} ${getStatusClass(reservation.status)}`}>
                        {reservation.status || 'Pending'}
                      </span>
                  </td>
                  <td>
                      <span className={`${styles.paidBadge} ${reservation.isPaid ? styles.paidYes : styles.paidNo}`}>
                        {reservation.isPaid ? '✓ Paid' : '✗ Unpaid'}
                      </span>
                    {reservation.isPaid && reservation.paidAt && (
                      <span className={styles.paidDate}>
                          {formatDateTime(reservation.paidAt).date}
                        </span>
                    )}
                  </td>
                  <td>
                      <span className={styles.cellNotes} title={reservation.notes}>
                        {reservation.notes || '-'}
                      </span>
                  </td>
                  <td>
                    <div className={styles.cellDate}>
                      <span className={styles.dateValue}>{createdAt.date}</span>
                      <span className={styles.timeValue}>{createdAt.time}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionsCell}>
                      {reservation.isPaid ? (
                        <button
                          className={`${styles.actionBtn} ${styles.unpaidBtn}`}
                          onClick={() => handleUnmarkAsPaid(reservation.id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          <span>Unpaid</span>
                        </button>
                      ) : (
                        <button
                          className={`${styles.actionBtn} ${styles.paidBtn}`}
                          onClick={() => handleMarkAsPaid(reservation.id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                          <span>Paid</span>
                        </button>
                      )}
                      <button
                        className={`${styles.actionBtn} ${styles.editBtn}`}
                        onClick={() => handleEdit(reservation)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                        <span>Edit</span>
                      </button>
                      <button
                        className={`${styles.actionBtn} ${styles.deleteBtn}`}
                        onClick={() => handleDelete(reservation.id)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                        <span>Delete</span>
                      </button>
                    </div>
                  </td>
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
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <h4 className={styles.emptyTitle}>No reservations yet</h4>
          <p className={styles.emptyMessage}>
            Create your first reservation to start managing bookings.
          </p>
          <button
            className={styles.emptyAction}
            onClick={() => setShowForm(true)}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Create First Reservation
          </button>
        </div>
      )}
    </div>
  );
};

export default ReservationList;