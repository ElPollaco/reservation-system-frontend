import {useState, useEffect} from 'react';
import styles from '../../AvailabilityCalendar.module.css';

const AvailabilityModal = ({
                      isOpen,
                      onClose,
                      selectedDate,
                      selectedAvailability,
                      slotsForDay,
                      classesForDay,
                      onSave,
                      onDelete
                    }) => {
  const [formError, setFormError] = useState(null);
  const [saving, setSaving] = useState(false);

  const formatLocalDate = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [formData, setFormData] = useState({
    date: selectedDate ? formatLocalDate(selectedDate) : '',
    startTime: '08:00',
    endTime: '16:00',
  });

  useEffect(() => {
    if (selectedAvailability) {
      const date = new Date(selectedAvailability.date);
      const startTime = new Date(selectedAvailability.startTime);
      const endTime = new Date(selectedAvailability.endTime);

      setFormData({
        date: date.toISOString().split('T')[0],
        startTime: `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`,
        endTime: `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`,
      });
    } else {
      setFormData({
        date: selectedDate ? formatLocalDate(selectedDate) : '',
        startTime: '08:00',
        endTime: '16:00',
      });
    }
    setFormError(null);
  }, [selectedAvailability, selectedDate]);

  const isOverlapping = (startA, endA, startB, endB) => {
    return startA < endB && endA > startB;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedDate) {
        setFormError("Error: no date selected");
        return;
    }

    // only add, no editing
    if (selectedAvailability) {
        setFormError("Editing is not supported as for right now.");
        return;
    }

    setSaving(true);

    try {
      const [startH, startM] = formData.startTime.split(':').map(Number);
      const [endH, endM] = formData.endTime.split(':').map(Number);

      if (isNaN(startH) || isNaN(startM) || isNaN(endH) || isNaN(endM)) {
        setFormError('Error: invalid time format');
        return;
      }

      const startLocal = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        startH,
        startM,
        0,
        0
      );

      const endLocal = new Date(
        selectedDate.getFullYear(),
        selectedDate.getMonth(),
        selectedDate.getDate(),
        endH,
        endM,
        0,
        0
      );

      const overlappingSlots = slotsForDay.filter((slot) => {
        const slotStart = new Date(slot.startTime);
        const slotEnd = new Date(slot.endTime);

        return isOverlapping(startLocal, endLocal, slotStart, slotEnd);
      });

      const overlappingClasses = classesForDay.filter((cls) => {
        const classStart = new Date(cls.startTime);
        const classEnd = new Date(cls.endTime);
        return isOverlapping(startLocal, endLocal, classStart, classEnd);
      }); 

      if (endLocal <= startLocal) {
        setFormError("End time must be after start time.");
        return;
      }
      if (overlappingSlots.length > 0) {
        const conflicts = overlappingSlots
            .map((slot) => `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`)
            .join(", ");

        setFormError(`This availability overlaps with existing availabilities(s): ${conflicts}`);
        return;
      }
      if (overlappingClasses.length > 0) {
        const conflicts = overlappingClasses
            .map((cls) => `${formatTime(cls.startTime)} - ${formatTime(cls.endTime)}`)
            .join(", ");

        setFormError(`This availability overlaps with existing class(es): ${conflicts}`);
        return;
      }

      const payload = {
        date: formatLocalDate(selectedDate),
        startTime: `${formatLocalDate(selectedDate)}T${String(startH).padStart(2, '0')}:${String(startM).padStart(2, '0')}:00`,
        endTime: `${formatLocalDate(selectedDate)}T${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:00`,
      }

      await onSave(payload);
        onClose();
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

  if (!isOpen) return null;

  const isDeleting = !!selectedAvailability;

  const slotsAndClassesForDay = [
    ...slotsForDay.map(slot => ({ ...slot, type: "availability" })),
    ...classesForDay.map(cls => ({ ...cls, type: "class" }))
  ].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));

  const slotsAndClassesForDayWithoutSelected = slotsForDay.filter(
    slot => !selectedAvailability || slot.id !== selectedAvailability.id
  );

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div className={styles.modalHeaderContent}>
            <div className={styles.modalIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                    <line x1="12" y1="14" x2="12" y2="18"></line>
                    <line x1="10" y1="16" x2="14" y2="16"></line>
                </svg>
            </div>
            <div>
              <h2 className={styles.modalTitle}>
                {isDeleting ? 'Delete Availability Slot' : 'New Availability Slot'}
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
          
          <form onSubmit={handleSubmit} className={styles.availabilityForm}>
            <div className={styles.formGroup}>
              <label htmlFor="startTime">Start Time</label>
              {!isDeleting ? (
                <input
                type="time"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleInputChange}
                required
                className={styles.formInput}
              />
              )
              : (
                <div className={styles.formInput}>
                  {formatTime(selectedAvailability.startTime)}
                </div>
              )}
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="endTime">End Time</label>
              {!isDeleting ? (
                <input
                type="time"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleInputChange}
                required
                className={styles.formInput}
              />
              ) : (
                <div className={styles.formInput}>
                  {formatTime(selectedAvailability.endTime)}
                </div>
              )}
            </div>

            <div className={styles.formActions}>
              {isDeleting && (
                <button
                  type="button"
                  onClick={() => onDelete(selectedAvailability.id)}
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
                {!isDeleting &&
                    <button
                    type="submit"
                    disabled={saving || !selectedDate}
                    className={styles.saveBtn}
                    >
                    Add Availability Slot
                    </button>}
              </div>
            </div>
          </form>

          {slotsAndClassesForDay.length > 0 && (
            <div className={styles.dayAvailabilitiesList}>
              <h3>
                {isDeleting
                  ? `Other vacant/occupied slots (${slotsAndClassesForDayWithoutSelected.length})`
                  : `Slots today (${slotsAndClassesForDay.length})`
                }
              </h3>
              {(isDeleting ? slotsAndClassesForDayWithoutSelected : slotsAndClassesForDay).length > 0 ? (
                <ul>
                  {(isDeleting ? slotsAndClassesForDayWithoutSelected : slotsAndClassesForDay).map((slot, index) => (
                    <li key={slot.id ?? `${slot.startTime}-${slot.endTime}-${index}`} className={styles.dayAvailabilityItem}>
                      <div className={styles.slotItemTime}>
                        {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                      </div>
                      <div className={styles.slotItemDetails}>
                        <strong>{slot.type === "class" ? "Class" : "Availability"}</strong>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.noOtherAvailabilities}>No other vacant/occupied slots on this day</p>
              )}
              {!isDeleting && slotsForDay.length === 0 && 
                <p className={styles.noOtherAvailabilities}>No vacant/occupied slots on this day</p>
              } 
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityModal;