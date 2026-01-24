import styles from '../../ReservationList.module.css';

const ReservationHeader = ({
                             totalCount,
                             showForm,
                             onToggleForm
                           }) => {
  return (
    <div className={styles.header}>
      <div className={styles.headerLeft}>
        <h3 className={styles.title}>Reservations</h3>
        {totalCount > 0 && (
          <span className={styles.reservationCount}>
            {totalCount} {totalCount === 1 ? 'reservation' : 'reservations'}
          </span>
        )}
      </div>
      <button
        className={`${styles.addBtn} ${showForm ? styles.addBtnCancel : ''}`}
        onClick={onToggleForm}
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
  );
};

export default ReservationHeader;