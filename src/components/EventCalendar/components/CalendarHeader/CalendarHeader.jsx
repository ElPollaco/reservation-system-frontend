import styles from '../../EventCalendar.module.css';

const CalendarHeader = ({
                          currentDate,
                          onPrevMonth,
                          onNextMonth,
                          onToday,
                          eventsCount,
                          totalEvents,
                          eventTypes,
                          selectedEventTypeId,
                          onEventTypeFilter,
                          loading
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
              <span>{eventsCount}</span>
              events this month
            </span>
            <span className={styles.statDivider}>•</span>
            <span className={styles.statItem}>
              {totalEvents} total loaded
            </span>
            <span className={styles.statDivider}>•</span>

            <div className={styles.filterInline}>
              <label htmlFor="eventTypeFilter" className={styles.statItem}>
                Filter:
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="eventTypeFilter"
                  className={styles.filterSelectInline}
                  value={selectedEventTypeId}
                  onChange={(e) => onEventTypeFilter(e.target.value)}
                  disabled={loading}
                >
                  <option value="">All types</option>
                  {eventTypes.map(type => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
                <svg className={styles.selectArrow} viewBox="0 0 24 24" fill="none" stroke="currentColor"
                     strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>

              {selectedEventTypeId && (
                <button
                  className={styles.clearFilterBtn}
                  onClick={() => onEventTypeFilter('')}
                  title="Clear filter"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              )}
            </div>
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

export default CalendarHeader;