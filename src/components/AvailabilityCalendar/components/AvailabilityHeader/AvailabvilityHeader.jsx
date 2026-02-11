import styles from '../../AvailabilityCalendar.module.css';

const AvailabilityHeader = ({
                          currentDate,
                          onPrevMonth,
                          onNextMonth,
                          onToday,
                          availabilitiesCount,
                          totalAvailabilities,
                        }) => {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const month = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  return (
    <header className={styles.calendarHeader}>
      <div className={styles.headerRow}>
        <div className={styles.headerLeft}>
          <h1 className={styles.calendarTitle}>
            {month} {year}
          </h1>

          <div className={styles.headerStats}>
            <span className={styles.statItem}>
              <span>{availabilitiesCount}</span>
              availabilities this month
            </span>
            <span className={styles.statDivider}>•</span>
            <span className={styles.statItem}>
              {totalAvailabilities} total loaded
            </span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            onClick={onToday}
            className={styles.todayBtn}
            title="Go to today"
          >
            Today
          </button>

          <div className={styles.navButtons}>
            <button
              onClick={onPrevMonth}
              className={styles.navBtn}
              aria-label="Previous month"
              title="Previous month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>

            <button
              onClick={onNextMonth}
              className={styles.navBtn}
              aria-label="Next month"
              title="Next month"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AvailabilityHeader;