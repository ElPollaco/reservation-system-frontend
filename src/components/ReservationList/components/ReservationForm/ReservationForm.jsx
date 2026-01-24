import {useState} from 'react';
import EventCalendarSelector from '../EventCalendarSelector/EventCalendarSelector';
import NewParticipantModal from '../NewParticipantModal/NewParticipantModal';
import styles from '../../ReservationList.module.css';

const ReservationForm = ({
                           editingReservation,
                           eventSchedules,
                           participants,
                           eventTypes,
                           onSubmit,
                           onCancel,
                           onAddParticipant
                         }) => {
  const [formData, setFormData] = useState({
    eventScheduleId: editingReservation?.eventSchedule?.id || '',
    participantsIds: editingReservation?.participants?.map(p => p.id) || [],
    notes: editingReservation?.notes || '',
    isPaid: editingReservation?.isPaid || false
  });

  const [showNewParticipantModal, setShowNewParticipantModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const addedParticipants = participants.filter(p => formData.participantsIds.includes(p.id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!editingReservation && !formData.eventScheduleId) {
      setFormError('Please select an event');
      return;
    }

    if (!editingReservation && formData.participantsIds.length === 0) {
      setFormError('Please add at least one participant');
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEventSelect = (eventId) => {
    setFormData(prev => ({...prev, eventScheduleId: eventId}));
  };

  const handleRemoveParticipant = (participantId) => {
    setFormData(prev => ({
      ...prev,
      participantsIds: prev.participantsIds.filter(id => id !== participantId)
    }));
  };

  const handleNewParticipant = async (participantData) => {
    try {
      const newId = await onAddParticipant(participantData);
      if (newId) {
        setFormData(prev => ({
          ...prev,
          participantsIds: [...prev.participantsIds, newId]
        }));
      }
      setShowNewParticipantModal(false);
    } catch (err) {
      throw err;
    }
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  const isValid = editingReservation || (formData.eventScheduleId && formData.participantsIds.length > 0);

  return (
    <div className={styles.formWrapper}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h4 className={styles.formTitle}>
          {editingReservation ? 'Edit Reservation' : 'Create New Reservation'}
        </h4>

        {formError && (
          <div className={styles.errorMessage}>
            <div className={styles.errorContent}>
              <svg className={styles.errorIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{formError}</span>
            </div>
            <button type="button" className={styles.dismissBtn} onClick={() => setFormError(null)}>
              Dismiss
            </button>
          </div>
        )}

        {!editingReservation && (
          <>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Select Event <span className={styles.required}>*</span>
              </label>
              <EventCalendarSelector
                eventSchedules={eventSchedules}
                eventTypes={eventTypes}
                selectedEventId={formData.eventScheduleId}
                onSelectEvent={handleEventSelect}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                Participants <span className={styles.required}>*</span>
              </label>
              <div className={styles.addedParticipantsSection}>
                <div className={styles.addedParticipantsHeader}>
                  <div className={styles.addedParticipantsTitle}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    Added Participants
                    {addedParticipants.length > 0 && (
                      <span className={styles.selectedBadge}>{addedParticipants.length}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className={styles.addNewParticipantBtn}
                    onClick={() => setShowNewParticipantModal(true)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                      <circle cx="8.5" cy="7" r="4"></circle>
                      <line x1="20" y1="8" x2="20" y2="14"></line>
                      <line x1="23" y1="11" x2="17" y2="11"></line>
                    </svg>
                    Add Participant
                  </button>
                </div>

                <div className={styles.addedParticipantsList}>
                  {addedParticipants.length > 0 ? (
                    addedParticipants.map(participant => (
                      <div key={participant.id} className={styles.addedParticipantItem}>
                        <div className={styles.addedParticipantAvatar}>
                          {getInitials(participant.firstName, participant.lastName)}
                        </div>
                        <div className={styles.addedParticipantInfo}>
                          <div className={styles.addedParticipantName}>
                            {participant.firstName} {participant.lastName}
                          </div>
                          <div className={styles.addedParticipantEmail}>
                            {participant.email}
                          </div>
                          <div className={styles.addedParticipantEmail}>
                            {participant.phone}
                          </div>
                        </div>
                        <button
                          type="button"
                          className={styles.removeParticipantBtn}
                          onClick={() => handleRemoveParticipant(participant.id)}
                          title="Remove participant"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className={styles.noAddedParticipants}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                        <circle cx="9" cy="7" r="4"></circle>
                        <line x1="17" y1="8" x2="23" y2="8"></line>
                      </svg>
                      <span>No participants added yet</span>
                      <span className={styles.noAddedParticipantsHint}>
                        Click "Add Participant" to create and add participants
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <label className={styles.checkboxGroup}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={formData.isPaid}
                onChange={(e) => setFormData({...formData, isPaid: e.target.checked})}
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
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
          />
        </div>

        <div className={styles.formActions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!isValid || submitting}
          >
            {submitting ? (
              'Saving...'
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                {editingReservation ? 'Update' : 'Create Reservation'}
              </>
            )}
          </button>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            Cancel
          </button>
        </div>
      </form>

      {showNewParticipantModal && (
        <NewParticipantModal
          onClose={() => setShowNewParticipantModal(false)}
          onSubmit={handleNewParticipant}
        />
      )}
    </div>
  );
};

export default ReservationForm;