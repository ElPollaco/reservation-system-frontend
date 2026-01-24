import {useState, useEffect} from 'react';
import styles from '../../EventCalendar.module.css';

const EventModal = ({
                      isOpen,
                      onClose,
                      selectedDate,
                      selectedEvent,
                      eventTypes,
                      eventsForDay,
                      onSave,
                      onDelete,
                      onEditEvent
                    }) => {
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    eventTypeId: '',
    placeName: '',
    time: '09:00'
  });

  useEffect(() => {
    if (selectedEvent) {
      const eventDate = new Date(selectedEvent.startTime);
      const hours = String(eventDate.getHours()).padStart(2, '0');
      const minutes = String(eventDate.getMinutes()).padStart(2, '0');

      setFormData({
        eventTypeId: selectedEvent.eventType?.id || '',
        placeName: selectedEvent.placeName || '',
        time: `${hours}:${minutes}`
      });
    } else {
      setFormData({
        eventTypeId: '',
        placeName: '',
        time: '09:00'
      });
    }
    setFormError(null);
  }, [selectedEvent, selectedDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedDate) {
      setFormError('Error: no date selected');
      return;
    }

    setSaving(true);

    try {
      const [hours, minutes] = formData.time.split(':').map(Number);

      const eventDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hours,
        minutes,
        0,
        0
      );

      if (isNaN(eventDateTime.getTime())) {
        setFormError('Error: invalid date');
        return;
      }

      await onSave({
        eventTypeId: formData.eventTypeId,
        placeName: formData.placeName,
        startTime: eventDateTime
      });
    } catch (err) {
      setFormError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const {name, value} = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const formatDate = (date) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusLabel = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'Confirmed';
      case 'pending':
        return 'Pending';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status || 'Unknown';
    }
  };

  if (!isOpen) return null;

  const isEditing = !!selectedEvent;
  const otherEventsForDay = eventsForDay.filter(
    event => !selectedEvent || event.id !== selectedEvent.id
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            <div className={styles.modalIcon}>
              {isEditing ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                  <line x1="12" y1="14" x2="12" y2="18"></line>
                  <line x1="10" y1="16" x2="14" y2="16"></line>
                </svg>
              )}
            </div>
            <div>
              <h2 className={styles.modalTitle}>
                {isEditing ? 'Edit Event' : 'New Event'}
              </h2>
              <p className={styles.modalDate}>
                {formatDate(selectedDate)}
              </p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.modalContent}>
          {formError && (
            <div className={styles.formError}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{formError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.eventForm}>
            <div className={styles.formGroup}>
              <label htmlFor="eventTypeId">Event Type</label>
              <div className={styles.selectWrapper}>
                <select
                  id="eventTypeId"
                  name="eventTypeId"
                  value={formData.eventTypeId}
                  onChange={handleInputChange}
                  required
                  className={styles.formSelect}
                >
                  <option value="">Select event type...</option>
                  {eventTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.duration} min, ${type.price})
                    </option>
                  ))}
                </select>
                <svg className={styles.selectArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="placeName">Location</label>
              <input
                type="text"
                id="placeName"
                name="placeName"
                value={formData.placeName}
                onChange={handleInputChange}
                placeholder="e.g. Room A, Online, Office..."
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="time">Start Time</label>
              <input
                type="time"
                id="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formActions}>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => onDelete(selectedEvent.id)}
                  className={styles.deleteBtn}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="3 6 5 6 21 6"></polyline>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  </svg>
                  Delete
                </button>
              )}

              <div className={styles.formActionsBtns}>
                <button type="button" onClick={onClose} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !selectedDate}
                  className={styles.saveBtn}
                >
                  {saving ? (
                    <>
                      <span className={styles.spinnerSmall}></span>
                      Saving...
                    </>
                  ) : (
                    isEditing ? 'Save Changes' : 'Add Event'
                  )}
                </button>
              </div>
            </div>
          </form>

          {eventsForDay.length > 0 && (
            <div className={styles.dayEventsList}>
              <h3>
                {isEditing
                  ? `Other events (${otherEventsForDay.length})`
                  : `Events today (${eventsForDay.length})`
                }
              </h3>
              {(isEditing ? otherEventsForDay : eventsForDay).length > 0 ? (
                <ul>
                  {(isEditing ? otherEventsForDay : eventsForDay).map(event => (
                    <li key={event.id} className={styles.dayEventItem}>
                      <div className={styles.eventItemTime}>
                        {formatTime(event.startTime)}
                      </div>
                      <div className={styles.eventItemDetails}>
                        <strong>{event.eventType?.name}</strong>
                        <span>{event.placeName}</span>
                      </div>
                      <span
                        className={styles.eventItemStatus}
                        data-status={event.status?.toLowerCase()}
                      >
                        {getStatusLabel(event.status)}
                      </span>
                      <button
                        type="button"
                        className={styles.editEventBtn}
                        onClick={() => onEditEvent(event)}
                        title="Edit this event"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.noOtherEvents}>No other events on this day</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;