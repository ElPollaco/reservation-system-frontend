import {useState} from 'react';
import styles from '../../ReservationList.module.css';

const NewParticipantModal = ({onClose, onSubmit}) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    gdprConsent: false
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError(null);
      await onSubmit(formData);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h4 className={styles.modalTitle}>Add New Participant</h4>
          <button
            type="button"
            className={styles.modalCloseBtn}
            onClick={onClose}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>
          {error && (
            <div className={styles.errorMessage}>
              <div className={styles.errorContent}>
                <span>{error}</span>
              </div>
              <button className={styles.dismissBtn} onClick={() => setError(null)}>
                Dismiss
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.modalForm}>
            <div className={styles.modalFormRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  First Name <span className={styles.required}>*</span>
                </label>
                <input
                  type="text"
                  className={styles.formInput}
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
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
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
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
                value={formData.email}
                onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
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
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({...prev, phone: e.target.value}))}
                required
              />
            </div>

            <label className={styles.checkboxGroup}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={formData.gdprConsent}
                onChange={(e) => setFormData(prev => ({...prev, gdprConsent: e.target.checked}))}
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
                disabled={submitting}
              >
                {submitting ? 'Creating...' : 'Create & Select'}
              </button>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={onClose}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewParticipantModal;