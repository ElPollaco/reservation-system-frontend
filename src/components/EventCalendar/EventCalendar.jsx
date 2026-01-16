import {useState, useEffect, useMemo} from 'react';
import {eventScheduleApi, eventTypeApi} from '../../services/api';
import {useAuth} from '../../context/AuthContext';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import EventModal from './EventModal';
import styles from './EventCalendar.module.css';

const EventCalendar = () => {
  const {selectedCompany} = useAuth();
  const companyId = selectedCompany?.id;

  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const fetchData = async () => {
    if (!companyId) return;

    try {
      setLoading(true);
      setError(null);

      const [schedulesRes, eventTypesRes] = await Promise.all([
        eventScheduleApi.getAll(companyId, {Page: 1, PageSize: 100}),
        eventTypeApi.getAll(companyId)
      ]);

      const schedulesData = schedulesRes.data.items || [];

      setSchedules(schedulesData);
      setEventTypes(eventTypesRes.data.items || []);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [companyId]);

  // Grupowanie wydarzeń po datach
  const eventsByDate = useMemo(() => {
    const grouped = {};

    schedules.forEach(schedule => {
      if (!schedule.startTime) return;

      const dateObj = new Date(schedule.startTime);
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(schedule);
    });

    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) =>
        new Date(a.startTime) - new Date(b.startTime)
      );
    });

    return grouped;
  }, [schedules]);

  // ✅ Lista dat z wydarzeniami (do przekazania do headera)
  const eventDates = useMemo(() => Object.keys(eventsByDate), [eventsByDate]);

  // ✅ Liczba wydarzeń w aktualnym miesiącu
  const eventsInCurrentMonth = useMemo(() => {
    const currentMonthKey = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
    return eventDates.filter(date => date.startsWith(currentMonthKey)).reduce((sum, date) => {
      return sum + (eventsByDate[date]?.length || 0);
    }, 0);
  }, [currentDate, eventDates, eventsByDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setModalOpen(true);
  };

  const handleEventClick = (event, e) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setSelectedDate(new Date(event.startTime));
    setModalOpen(true);
  };

  const handleSaveEvent = async (formData) => {
    try {
      setError(null);

      const startTime = formData.startTime instanceof Date
        ? formData.startTime.toISOString()
        : new Date(formData.startTime).toISOString();

      const requestData = {
        eventTypeId: formData.eventTypeId,
        placeName: formData.placeName,
        startTime: startTime
      };

      if (selectedEvent) {
        await eventScheduleApi.update(companyId, selectedEvent.id, requestData);
      } else {
        await eventScheduleApi.create(companyId, requestData);
      }

      await fetchData();
      setModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Czy na pewno chcesz usunąć to wydarzenie?')) return;

    try {
      await eventScheduleApi.delete(companyId, eventId);
      await fetchData();
      setModalOpen(false);
      setSelectedEvent(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);
  };

  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];

    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const dateKey = `${year}-${month}-${day}`;

    return eventsByDate[dateKey] || [];
  };

  if (loading) {
    return (
      <div className={styles.calendarLoading}>
        <div className="spinner"></div>
        <p>Ładowanie kalendarza...</p>
      </div>
    );
  }

  return (
    <div className={styles.calendar}>
      {error && (
        <div className={styles.calendarError}>
          <span>⚠️ {error}</span>
          <button onClick={fetchData} className={styles.retryBtn}>
            Spróbuj ponownie
          </button>
        </div>
      )}


      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
        eventsCount={eventsInCurrentMonth}
        eventDates={eventDates}
      />

      <CalendarGrid
        currentDate={currentDate}
        eventsByDate={eventsByDate}
        onDayClick={handleDayClick}
        onEventClick={handleEventClick}
      />

      {modalOpen && (
        <EventModal
          isOpen={modalOpen}
          onClose={closeModal}
          selectedDate={selectedDate}
          selectedEvent={selectedEvent}
          eventTypes={eventTypes}
          eventsForDay={getEventsForSelectedDate()}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      )}
    </div>
  );
};

export default EventCalendar;