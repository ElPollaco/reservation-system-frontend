import {useMemo} from 'react';
import styles from '../../EventCalendar.module.css';

const CalendarGrid = ({
                        currentDate,
                        eventsByDate,
                        onDayClick,
                        onEventClick
                      }) => {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    let startDay = firstDayOfMonth.getDay() - 1;
    if (startDay < 0) startDay = 6;

    const daysInMonth = lastDayOfMonth.getDate();
    const days = [];

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

  function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function isSameDay(date1, date2) {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  }

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return 'green';
      case 'pending':
        return 'orange';
      case 'cancelled':
        return 'red';
      default:
        return 'blue';
    }
  };

  return (
    <div className={styles.calendarGrid}>
      <div className={styles.weekDaysHeader}>
        {weekDays.map(day => (
          <div key={day} className={styles.weekDay}>
            {day}
          </div>
        ))}
      </div>

      <div className={styles.daysGrid}>
        {calendarDays.map((dayData, index) => {
          const dayEvents = eventsByDate[dayData.dateKey] || [];

          return (
            <div
              key={index}
              className={`
                ${styles.dayCell}
                ${!dayData.isCurrentMonth ? styles.otherMonth : ''}
                ${dayData.isToday ? styles.today : ''}
              `}
              onClick={() => onDayClick(dayData.date)}
            >
              <div className={styles.dayHeader}>
                <span className={styles.dayNumber}>
                  {dayData.date.getDate()}
                </span>
              </div>

              <div className={styles.dayEvents}>
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    className={styles.eventPill}
                    data-status={getStatusColor(event.status)}
                    onClick={(e) => onEventClick(event, e)}
                    title={`${event.eventType?.name || 'Event'} - ${event.placeName}`}
                  >
                    <span className={styles.eventTime}>
                      {formatTime(event.startTime)}
                    </span>
                    <span className={styles.eventName}>
                      {event.eventType?.name || 'Event'}
                    </span>
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div className={styles.moreEvents}>
                    +{dayEvents.length - 3} more
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