import {useState, useEffect, useMemo, useCallback, use} from 'react';
import {useSearchParams} from 'react-router-dom';
import {eventTypeApi, staffMemberApi} from '../../services/api';
import {useAuth} from '../../context/AuthContext';
import CalendarHeader from '../../components/EventCalendar/components/CalendarHeader/CalendarHeader.jsx';
import CalendarGrid from '../../components/EventCalendar/components/CalendarGrid/CalendarGrid.jsx';
import EventModal from '../../components/EventCalendar/components/EventModal/EventModal.jsx';
import ErrorModal from '../common/ErrorModal/ErrorModal';
import styles from './TrainerClassesCalendar.module.css';

const EventCalendar = () => {
  const {selectedCompany, staffMember, isTrainer} = useAuth();
  const companyId = selectedCompany?.id;
  const staffMemberId = staffMember?.id;
  const [searchParams, setSearchParams] = useSearchParams();

  const monthParam = searchParams.get('month');
  const eventTypeParam = searchParams.get('eventType') || '';
  const editParam = searchParams.get('edit');
  const dayParam = searchParams.get('day');

  const getInitialDate = useCallback(() => {
    if (monthParam) {
      const [year, month] = monthParam.split('-').map(Number);
      if (year && month && month >= 1 && month <= 12) {
        return new Date(year, month - 1, 1);
      }
    }
    return new Date();
  }, [monthParam]);

  const [currentDate, setCurrentDate] = useState(getInitialDate);
  const [classes, setClasses] = useState([]);
  const [eventTypes, setEventTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const formatMonthKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  };

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (monthParam) {
      const [year, month] = monthParam.split('-').map(Number);
      if (year && month && month >= 1 && month <= 12) {
        const newDate = new Date(year, month - 1, 1);
        if (formatMonthKey(newDate) !== formatMonthKey(currentDate)) {
          setCurrentDate(newDate);
        }
      }
    }
  }, [monthParam]);

  const updateMonth = useCallback((newDate) => {
    setCurrentDate(newDate);
    const newMonthKey = formatMonthKey(newDate);

    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('month', newMonthKey);
      return params;
    }, {replace: true});
  }, [setSearchParams]);

  const handleEventTypeFilter = useCallback((eventTypeId) => {
    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      if (eventTypeId) {
        params.set('eventType', eventTypeId);
      } else {
        params.delete('eventType');
      }
      return params;
    }, {replace: true});
  }, [setSearchParams]);

  const openEditModal = useCallback((event) => {
    setSelectedEvent(event);
    setSelectedDate(new Date(event.startTime));
    setModalOpen(true);

    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('edit', event.id);
      params.delete('day');
      return params;
    }, {replace: true});
  }, [setSearchParams]);

  const openAddModal = useCallback((date) => {
    setSelectedDate(date);
    setSelectedEvent(null);
    setModalOpen(true);

    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.set('day', formatDateKey(date));
      params.delete('edit');
      return params;
    }, {replace: true});
  }, [setSearchParams]);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedEvent(null);
    setSelectedDate(null);

    setSearchParams(prev => {
      const params = new URLSearchParams(prev);
      params.delete('edit');
      params.delete('day');
      return params;
    }, {replace: true});
  }, [setSearchParams]);

  useEffect(() => {
    if (editParam && classes.length > 0) {
      const event = classes.find(s => s.id === editParam);
      if (event) {
        setSelectedEvent(event);
        setSelectedDate(new Date(event.startTime));
        setModalOpen(true);
      }
    } else if (dayParam && !editParam) {
      const [year, month, day] = dayParam.split('-').map(Number);
      if (year && month && day) {
        setSelectedDate(new Date(year, month - 1, day));
        setSelectedEvent(null);
        setModalOpen(true);
      }
    } else if (!editParam && !dayParam) {
      if (modalOpen) {
        setModalOpen(false);
        setSelectedEvent(null);
        setSelectedDate(null);
      }
    }
  }, [editParam, dayParam, classes]);

  const fetchEventTypes = useCallback(async () => {
    if (!companyId) return;
    try {
      const response = await eventTypeApi.getAll(companyId);
      setEventTypes(response.data.items || []);
    } catch (err) {
      console.error('Error fetching event types:', err);
    }
  }, [companyId]);

  const fetchTrainerClasses = useCallback(async () => {
    if (!companyId || !staffMemberId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await staffMemberApi.getEventSchedules(companyId, staffMemberId);
      const data = response.data;
      setClasses(data || []);
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [companyId, staffMemberId]);

  useEffect(() => {
    fetchEventTypes();
  }, [fetchEventTypes]);

  useEffect(() => {
    fetchTrainerClasses();
  }, [fetchTrainerClasses]);

  useEffect(() => {
    if (!monthParam) {
      const currentMonthKey = formatMonthKey(new Date());
      setSearchParams(prev => {
        const params = new URLSearchParams(prev);
        params.set('month', currentMonthKey);
        return params;
      }, {replace: true});
    }
  }, []);

  const eventsByDate = useMemo(() => {
    const grouped = {};

    classes.forEach(cls => {
      if (!cls.startTime) return;

      const dateKey = formatDateKey(new Date(cls.startTime));

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(cls);
    });

    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) =>
        new Date(a.startTime) - new Date(b.startTime)
      );
    });

    return grouped;
  }, [classes]);

  const eventDates = useMemo(() => Object.keys(eventsByDate), [eventsByDate]);

  const eventsInCurrentMonth = useMemo(() => {
    const currentMonthKey = formatMonthKey(currentDate);
    return eventDates
      .filter(date => date.startsWith(currentMonthKey))
      .reduce((sum, date) => sum + (eventsByDate[date]?.length || 0), 0);
  }, [currentDate, eventDates, eventsByDate]);

  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    updateMonth(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    updateMonth(newDate);
  };

  const goToToday = () => {
    updateMonth(new Date());
  };

  const handleDayClick = (date) => {
    if(isTrainer()){
      setSelectedDate(date);
      setSelectedEvent(null);
      setModalOpen(true);
      return;
    }

    openAddModal(date);
  };

  const handleEventClick = (event, e) => {
    e?.stopPropagation();

    if(isTrainer()){
      setSelectedEvent(event);
      setSelectedDate(new Date(event.startTime));
      setModalOpen(true);
      return;
    }

    openEditModal(event);
  };

  const handleEditEvent = (event) => {
    openEditModal(event);
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
        await staffMemberApi.update(companyId, selectedEvent.id, requestData);
      } else {
        await staffMemberApi.create(companyId, requestData);
      }

      await fetchTrainerClasses();
      closeModal();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;

    try {
      await staffMemberApi.removeFromEventSchedule(companyId, eventId);
      await fetchTrainerClasses();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const getEventsForSelectedDate = () => {
    if (!selectedDate) return [];
    const dateKey = formatDateKey(selectedDate);
    return eventsByDate[dateKey] || [];
  };

  const clearError = () => setError(null);

  if (loading && classes.length === 0) {
    return (
      <div className={styles.calendarLoading}>
        <div className="spinner"></div>
        <p>Loading calendar...</p>
      </div>
    );
  }

  return (
    <div className={styles.calendar}>
      <ErrorModal
        error={error}
        onClose={clearError}
        title="Calendar Error"
      />

      <CalendarHeader
        currentDate={currentDate}
        onPrevMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
        eventsCount={eventsInCurrentMonth}
        totalEvents={classes.length}
        eventTypes={eventTypes}
        selectedEventTypeId={eventTypeParam}
        onEventTypeFilter={handleEventTypeFilter}
        loading={loading}
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
          onEditEvent={handleEditEvent}
        />
      )}
    </div>
  );
};

export default EventCalendar;