import { useState, useEffect } from "react";
import styles from '../../TrainerAvailability.module.css';

const TrainerAvailabilityModal = ({ show, onClose, onSave, onDelete, initialData = {}, type }) => {
  const [formData, setFormData] = useState({
    date: initialData.date || "",
    startTime: initialData.startTime ? formatTime(initialData.startTime) : "",
    endTime: initialData.endTime ? formatTime(initialData.endTime) : "",
    isAvailable: initialData.isAvailable ?? true,
  });

  useEffect(() => {
    setFormData({
      date: initialData.date || "",
      startTime: initialData.startTime ? formatTime(initialData.startTime) : "",
      endTime: initialData.endTime ? formatTime(initialData.endTime) : "",
      isAvailable: initialData.isAvailable ?? true,
    });
  }, [initialData]);

  if (!show) return null;

  function formatTime(dateString) {
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.date || !formData.startTime || !formData.endTime) {
      alert("Please fill all fields");
      return;
    }

    const [startH, startM] = formData.startTime.split(":").map(Number);
    const [endH, endM] = formData.endTime.split(":").map(Number);

    if (endH < startH || (endH === startH && endM <= startM)) {
      alert("End time must be after start time");
      return;
    }

    onSave({
      date: formData.date,
      startTime: formData.startTime, 
      endTime: formData.endTime,
      isAvailable: formData.isAvailable,
      note: formData.note || "Available"
    });
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContainer}>
        <div className={styles.modalHeader}>
          <h3 className={styles.title}>
            {initialData.id ? "Edit Availability" : "Add Availability"}
          </h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ×
          </button>
        </div>

        <div className={styles.modalBody}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Day <span className={styles.required}>*</span></label>
              <input
                type="date"
                className={styles.formInput}
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Start Time <span className={styles.required}>*</span></label>
              <input
                type="time"
                className={styles.formInput}
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>End Time <span className={styles.required}>*</span></label>
              <input
                type="time"
                className={styles.formInput}
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitBtn}>
                {initialData.id ? "Update Availability" : "Create Availability"}
              </button>
              <button type="button" className={styles.cancelBtn} onClick={onClose}>
                Cancel
              </button>
              {initialData.id && (
                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={() => onDelete(initialData.id)}
                >
                  Delete
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TrainerAvailabilityModal;