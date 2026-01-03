import {useState, useEffect} from 'react';
import styles from './EventCalendar.module.css';

const EventModal = ({
                      isOpen,
                      onClose,
                      selectedDate,
                      selectedEvent,
                      eventTypes,
                      eventsForDay,
                      onSave,
                      onDelete
                    }) => {
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    eventTypeId: '',
    placeName: '',
    time: '09:00'
  });

  // ✅ Debug - sprawdź selectedDate
  useEffect(() => {
    console.log('🔍 Modal opened with selectedDate:', selectedDate);
    console.log('🔍 selectedEvent:', selectedEvent);
  }, [selectedDate, selectedEvent]);

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

    // ✅ Walidacja - sprawdź czy mamy selectedDate
    if (!selectedDate) {
      setFormError('Błąd: brak wybranej daty');
      console.error('❌ selectedDate is null/undefined!');
      return;
    }

    setSaving(true);

    try {
      const [hours, minutes] = formData.time.split(':').map(Number);

      // ✅ Debug
      console.log('🔍 Creating date with:', {
        year: selectedDate.getFullYear(),
        month: selectedDate.getMonth(),
        day: selectedDate.getDate(),
        hours,
        minutes
      });

      const eventDateTime = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        hours,
        minutes,
        0,
        0
      );

      console.log('🔍 eventDateTime:', eventDateTime);
      console.log('🔍 eventDateTime.toISOString():', eventDateTime.toISOString());

      // ✅ Walidacja - czy data jest prawidłowa
      if (isNaN(eventDateTime.getTime())) {
        setFormError('Błąd: nieprawidłowa data');
        console.error('❌ Invalid date created!');
        return;
      }

      await onSave({
        eventTypeId: formData.eventTypeId,
        placeName: formData.placeName,
        startTime: eventDateTime
      });
    } catch (err) {
      console.error('❌ Submit error:', err);
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
    if (!date) return 'Brak daty';
    return new Date(date).toLocaleDateString('pl-PL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  const isEditing = !!selectedEvent;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>
              {isEditing ? 'Edytuj wydarzenie' : 'Nowe wydarzenie'}
            </h2>
            <p className={styles.modalDate}>
              {formatDate(selectedDate)}
            </p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Zamknij"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className={styles.modalContent}>
          {formError && (
            <div className={styles.formError}>
              <span>⚠️ {formError}</span>
            </div>
          )}

          {/* ✅ Sprawdź czy mamy datę */}
          {!selectedDate && (
            <div className={styles.formError}>
              <span>⚠️ Błąd: nie wybrano daty. Zamknij i kliknij ponownie w dzień kalendarza.</span>
            </div>
          )}

          {/* Formularz */}
          <form onSubmit={handleSubmit} className={styles.eventForm}>
            <div className={styles.formGroup}>
              <label htmlFor="eventTypeId">Typ wydarzenia *</label>
              <select
                id="eventTypeId"
                name="eventTypeId"
                value={formData.eventTypeId}
                onChange={handleInputChange}
                required
                className={styles.formSelect}
              >
                <option value="">-- Wybierz typ --</option>
                {eventTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} ({type.duration} min, {type.price} zł)
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="placeName">Miejsce *</label>
              <input
                type="text"
                id="placeName"
                name="placeName"
                value={formData.placeName}
                onChange={handleInputChange}
                placeholder="np. Sala A, Online, Biuro..."
                required
                className={styles.formInput}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="time">Godzina rozpoczęcia *</label>
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
                  Usuń
                </button>
              )}

              <div className={styles.formActionsBtns}>
                <button
                  type="button"
                  onClick={onClose}
                  className={styles.cancelBtn}
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={saving || !selectedDate}
                  className={styles.saveBtn}
                >
                  {saving ? (
                    <>
                      <span className={styles.spinnerSmall}></span>
                      Zapisywanie...
                    </>
                  ) : (
                    isEditing ? 'Zapisz zmiany' : 'Dodaj wydarzenie'
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Lista wydarzeń w tym dniu */}
          {eventsForDay.length > 0 && (
            <div className={styles.dayEventsList}>
              <h3>Inne wydarzenia tego dnia ({eventsForDay.length})</h3>
              <ul>
                {eventsForDay.map(event => (
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
                      {event.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventModal;