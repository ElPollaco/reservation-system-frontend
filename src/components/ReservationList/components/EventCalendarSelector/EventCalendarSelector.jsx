import {useState, useMemo} from 'react';
import styles from '../../ReservationList.module.css';

const EventCalendarSelector = ({
                                 eventSchedules,
                                 eventTypes,
                                 selectedEventId,
                                 onSelectEvent
                               }) => {
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [eventTypeFilter, setEventTypeFilter] = useState('');

  const eventsByDate = useMemo(() => {
    const grouped = {};

    const filteredSchedules = eventTypeFilter
      ? eventSchedules.filter(s => s.eventType?.id === eventTypeFilter)
      : eventSchedules;

    filteredSchedules.forEach(schedule => {
      if (!schedule.startTime) return;
      const dateKey = new Date(schedule.startTime).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(schedule);
    });

    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    });

    return grouped;
  }, [eventSchedules, eventTypeFilter]);

  const eventsForSelectedDay = useMemo(() => {
    if (!selectedDay) return [];
    const dateKey = selectedDay.toISOString().split('T')[0];
    return eventsByDate[dateKey] || [];
  }, [selectedDay, eventsByDate]);

  const selectedEvent = useMemo(() => {
    return eventSchedules.find(s => s.id === selectedEventId);
  }, [selectedEventId, eventSchedules]);

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return {date: '-', time: ''};
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {year: 'numeric', month: 'short', day: 'numeric'}),
      time: date.toLocaleTimeString('en-US', {hour: '2-digit', minute: '2-digit'})
    };
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    const days = [];

    const prevMonth = new Date(year, month, 0);
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true
      });
    }

    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  };

  const getEventsForDate = (date) => {
    const dateKey = date.toISOString().split('T')[0];
    return eventsByDate[dateKey] || [];
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelectedDay = (date) => {
    return selectedDay && date.toDateString() === selectedDay.toDateString();
  };

  const hasSelectedEvent = (date) => {
    if (!selectedEventId) return false;
    const dayEvents = getEventsForDate(date);
    return dayEvents.some(e => e.id === selectedEventId);
  };

  const handleDayClick = (date) => {
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length > 0) {
      setSelectedDay(date);
      if (selectedEventId) {
        const dateKey = date.toISOString().split('T')[0];
        const selectedEventDate = selectedEvent?.startTime
          ? new Date(selectedEvent.startTime).toISOString().split('T')[0]
          : null;
        if (selectedEventDate !== dateKey) {
          onSelectEvent('');
        }
      }
    }
  };

  const handleEventSelect = (eventId) => {
    onSelectEvent(eventId === selectedEventId ? '' : eventId);
  };

  const handleClosePanel = () => {
    setSelectedDay(null);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const calendarDays = getDaysInMonth(calendarDate);

  return (
    <div className={styles.eventCalendarSection}>
      <div className={styles.calendarHeader}>
        <select
          className={styles.calendarFilterSelect}
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
          style={{flex: 1, marginRight: 'var(--spacing-md)'}}
        >
          <option value="">All Event Types</option>
          {eventTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
        <span className={styles.calendarTitle}>
          {calendarDate.toLocaleDateString('en-US', {month: 'long', year: 'numeric'})}
        </span>
        <div className={styles.calendarNav}>
          <button
            type="button"
            className={styles.calendarNavBtn}
            onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button
            type="button"
            className={styles.calendarNavBtn}
            onClick={() => setCalendarDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <div className={styles.compactCalendar}>
        {weekDays.map(day => (
          <div key={day} className={styles.weekDayHeader}>{day}</div>
        ))}

        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day.date);
          const hasEvents = dayEvents.length > 0;

          return (
            <div
              key={index}
              className={`
                ${styles.calendarCell}
                ${!day.isCurrentMonth ? styles.calendarCellOther : ''}
                ${isToday(day.date) ? styles.calendarCellToday : ''}
                ${isSelectedDay(day.date) ? styles.calendarCellSelected : ''}
                ${hasSelectedEvent(day.date) ? styles.calendarCellSelected : ''}
                ${hasEvents ? styles.calendarCellClickable : ''}
              `}
              onClick={() => handleDayClick(day.date)}
            >
              <span className={styles.dayNumber}>{day.date.getDate()}</span>
              <div className={styles.dayEvents}>
                {dayEvents.slice(0, 2).map(event => (
                  <div
                    key={event.id}
                    className={`${styles.dayEventPill} ${selectedEventId === event.id ? styles.dayEventPillSelected : ''}`}
                    title={`${event.eventType?.name || 'Event'} - ${formatTime(event.startTime)}`}
                  >
                    {formatTime(event.startTime)} {event.eventType?.name?.substring(0, 8) || ''}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <span className={styles.moreEventsIndicator}>+{dayEvents.length - 2} more</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDay && eventsForSelectedDay.length > 0 && (
        <div className={styles.dayEventsPanel}>
          <div className={styles.dayEventsPanelHeader}>
            <span>
              Select event on {selectedDay.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'short',
              day: 'numeric'
            })}
            </span>
            <button
              type="button"
              className={styles.calendarNavBtn}
              onClick={handleClosePanel}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div className={styles.dayEventsList}>
            {eventsForSelectedDay.map(event => (
              <div
                key={event.id}
                className={`${styles.dayEventItem} ${selectedEventId === event.id ? styles.dayEventItemSelected : ''}`}
                onClick={() => handleEventSelect(event.id)}
              >
                <div className={styles.dayEventRadio}>
                  {selectedEventId === event.id && (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  )}
                </div>
                <div className={styles.dayEventInfo}>
                  <div className={styles.dayEventName}>{event.eventType?.name || 'Event'}</div>
                  <div className={styles.dayEventDetails}>
                    <span>{formatTime(event.startTime)}</span>
                    <span>•</span>
                    <span>{event.placeName}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedEvent && (
        <div className={styles.selectedEventBanner}>
          <div className={styles.selectedEventIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>
          <div className={styles.selectedEventInfo}>
            <div className={styles.selectedEventLabel}>Selected Event</div>
            <div className={styles.selectedEventName}>
              {selectedEvent.eventType?.name || 'Event'}
            </div>
            <div className={styles.selectedEventDetails}>
              {selectedEvent.placeName} • {formatDateTime(selectedEvent.startTime).date} at {formatTime(selectedEvent.startTime)}
            </div>
          </div>
          <button
            type="button"
            className={styles.clearEventBtn}
            onClick={() => onSelectEvent('')}
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};

export default EventCalendarSelector;