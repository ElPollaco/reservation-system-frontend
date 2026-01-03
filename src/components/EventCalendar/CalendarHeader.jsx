// src/components/EventCalendar/CalendarHeader.jsx
import styles from './EventCalendar.module.css';

const CalendarHeader = ({
                          currentDate,
                          onPrevMonth,
                          onNextMonth,
                          onToday,
                          eventsCount,
                          eventDates  // ✅ Nowy prop - lista dat z wydarzeniami
                        }) => {
  const monthNames = [
    'Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec',
    'Lipiec', 'Sierpień', 'Wrzesień', 'Październik', 'Listopad', 'Grudzień'
  ];

  const month = monthNames[currentDate.getMonth()];
  const year = currentDate.getFullYear();

  // ✅ Sprawdź czy obecny miesiąc ma wydarzenia
  const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  const hasEventsThisMonth = eventDates?.some(date => date.startsWith(currentMonthKey));

  return (
    <header className={styles.calendarHeader}>
      <div className={styles.headerLeft}>
        <h1 className={styles.calendarTitle}>
          {month} {year}
        </h1>
        <span className={styles.eventsCount}>
          {hasEventsThisMonth ? (
            `📅 ${eventsCount} wydarzeń w tym miesiącu`
          ) : (
            `Brak wydarzeń w tym miesiącu`
          )}
        </span>
      </div>

      <div className={styles.headerControls}>
        <button
          onClick={onToday}
          className={styles.todayBtn}
        >
          Dziś
        </button>

        <div className={styles.navButtons}>
          <button
            onClick={onPrevMonth}
            className={styles.navBtn}
            aria-label="Poprzedni miesiąc"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <button
            onClick={onNextMonth}
            className={styles.navBtn}
            aria-label="Następny miesiąc"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default CalendarHeader;