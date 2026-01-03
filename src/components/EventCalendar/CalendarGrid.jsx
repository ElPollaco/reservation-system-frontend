// src/components/EventCalendar/CalendarGrid.jsx
import { useMemo } from 'react';
import styles from './EventCalendar.module.css';

const CalendarGrid = ({
                        currentDate,
                        eventsByDate,
                        onDayClick,
                        onEventClick
                      }) => {
  const weekDays = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nd'];

  // Generowanie dni kalendarza
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const days = [];

    // Dni z poprzedniego miesiąca
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay - i);
      days.push({
        date,
        dateKey: formatDateKey(date),
        isCurrentMonth: false,
        isToday: false
      });
    }

    // Dni bieżącego miesiąca
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        dateKey: formatDateKey(date),
        isCurrentMonth: true,
        isToday: isSameDay(date, today)
      });
    }

    // Dni z następnego miesiąca
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        dateKey: formatDateKey(date),
        isCurrentMonth: false,
        isToday: false
      });
    }

    return days;
  }, [currentDate]);

  // ✅ Pomocnicza funkcja do formatowania klucza daty (YYYY-MM-DD)
  function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // ✅ Pomocnicza funkcja do porównywania dni
  function isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('pl-PL', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'green';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'blue';
    }
  };

  return (
    <div className={styles.calendarGrid}>
      {/* Nagłówki dni tygodnia */}
      <div className={styles.weekDaysHeader}>
        {weekDays.map(day => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      {/* Siatka dni */}
      <div className={styles.daysGrid}>
        {calendarDays.map((dayData, index) => {
          // ✅ Używamy przygotowanego dateKey
          const dayEvents = eventsByDate[dayData.dateKey] || [];
          const hasEvents = dayEvents.length > 0;

          // Debug - odkomentuj jeśli potrzebujesz
          // if (hasEvents) {
          //   console.log(`📅 ${dayData.dateKey}: ${dayEvents.length} wydarzeń`);
          // }

          return (
            <div
              key={index}
              className={`
                ${styles.dayCell}
                ${!dayData.isCurrentMonth ? styles.otherMonth : ''}
                ${dayData.isToday ? styles.today : ''}
                ${hasEvents ? styles.hasEvents : ''}
              `}
              onClick={() => onDayClick(dayData.date)}
            >
              <div className={styles.dayHeader}>
                <span className={styles.dayNumber}>
                  {dayData.date.getDate()}
                </span>
                {hasEvents && (
                  <span className={styles.eventCount}>
                    {dayEvents.length}
                  </span>
                )}
              </div>

              <div className={styles.dayEvents}>
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={styles.eventPill}
                    data-status={getStatusColor(event.status)}
                    onClick={(e) => onEventClick(event, e)}
                    title={`${event.eventType?.name || 'Wydarzenie'} - ${event.placeName}`}
                  >
                    <span className={styles.eventTime}>
                      {formatTime(event.startTime)}
                    </span>
                    <span className={styles.eventName}>
                      {event.eventType?.name || 'Wydarzenie'}
                    </span>
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div className={styles.moreEvents}>
                    +{dayEvents.length - 3} więcej
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarGrid;