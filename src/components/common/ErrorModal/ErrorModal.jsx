import styles from './ErrorModal.module.css';

const ErrorModal = ({ error, onClose, title = 'Error' }) => {
  if (!error) return null;

  const errorMessage = typeof error === 'string'
    ? error
    : error?.message || JSON.stringify(error);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{errorMessage}</p>
        <button className="submitBtn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;