import {useState} from 'react';
import styles from '../../ReservationList.module.css';
import {useAuth} from '../../../../context/AuthContext.jsx';

const MAX_VISIBLE_PARTICIPANTS = 2;

const ParticipantsCell = ({participants}) => {
  const [expanded, setExpanded] = useState(false);

  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();
  };

  if (!participants || participants.length === 0) {
    return <span className={styles.noData}>-</span>;
  }

  const visibleParticipants = expanded ? participants : participants.slice(0, MAX_VISIBLE_PARTICIPANTS);
  const hiddenCount = participants.length - MAX_VISIBLE_PARTICIPANTS;
  const hasMore = hiddenCount > 0;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded(!expanded);
  };

  return (
    <div className={styles.cellParticipants}>
      <div className={styles.participantsTagsWrapper}>
        {visibleParticipants.map(p => (
          <span key={p.id} className={styles.cellParticipantTag}>
            <span className={styles.cellParticipantAvatar}>
              {getInitials(p.firstName, p.lastName)}
            </span>
            {p.firstName} {p.lastName}
          </span>
        ))}
      </div>

      {hasMore && (
        <button
          type="button"
          className={styles.showMoreBtn}
          onClick={handleToggle}
        >
          {expanded ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="18 15 12 9 6 15"></polyline>
              </svg>
              Show less
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
              +{hiddenCount} more
            </>
          )}
        </button>
      )}
    </div>
  );
};

const ReservationTable = ({
                            reservations,
                            onEdit,
                            onDelete,
                            onMarkAsPaid,
                            onUnmarkAsPaid,
                            onShowForm
                          }) => {
  const formatDateTime = (dateString) => {
    if (!dateString) return {date: '-', time: ''};
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'}),
      time: date.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})
    };
  };

  const {isTrainer} = useAuth();

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'pending':
        return styles.statusPending;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return styles.statusPending;
    }
  };

  const handleAction = (e, action) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  if (reservations.length === 0) {
    return (
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
          type="button"
          className={styles.emptyAction}
          onClick={(e) => handleAction(e, onShowForm)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          Create First Reservation
        </button>
      </div>
    );
  }

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.tableHeader}>
        <tr>
          <th>Event</th>
          <th>Participants</th>
          <th>Status</th>
          <th>Payment</th>
          <th>Notes</th>
          {!isTrainer() ? (
            <>
              <th>Created</th>
              <th style={{ textAlign: 'right' }}>
                Actions
              </th>
            </>
          ) : (
            <th style={{ textAlign: 'right' }}>Created</th>
          )}
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
                <ParticipantsCell participants={reservation.participants}/>
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
              {!isTrainer() ? (
              <td>
                <div className={styles.cellDate}>
                  <span className={styles.dateValue}>{createdAt.date}</span>
                  <span className={styles.timeValue}>{createdAt.time}</span>
                </div>
              </td>
              ) : (
              <td style={{textAlign: 'right'}}>
                <div className={styles.cellDate}>
                  <span className={styles.dateValue}>{createdAt.date}</span>
                  <span className={styles.timeValue}>{createdAt.time}</span>
                </div>
              </td>
              )}
              {!isTrainer() &&
              <td>
                <div className={styles.actionsCell}>
                  {reservation.isPaid ? (
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.unpaidBtn}`}
                      onClick={(e) => handleAction(e, () => onUnmarkAsPaid(reservation.id))}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      <span>Unpaid</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className={`${styles.actionBtn} ${styles.paidBtn}`}
                      onClick={(e) => handleAction(e, () => onMarkAsPaid(reservation.id))}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span>Paid</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.editBtn}`}
                    onClick={(e) => handleAction(e, () => onEdit(reservation))}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <span>Edit</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    onClick={(e) => handleAction(e, () => onDelete(reservation.id))}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    <span>Delete</span>
                  </button>
                </div>
              </td>}
            </tr>
          );
        })}
        </tbody>
      </table>
    </div>
  );
};

export default ReservationTable;