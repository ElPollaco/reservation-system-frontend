import {useState, useEffect, useMemo, useCallback, use} from "react";
import {useSearchParams} from "react-router-dom";
import {staffMemberApi} from "../../services/api";
import {useAuth} from "../../context/AuthContext";
import AvailabilityHeader from "./components/AvailabilityHeader/AvailabvilityHeader.jsx";
import AvailabilityGrid from "./components/AvailabilityGrid/AvailabilityGrid.jsx";
import AvailabilityModal from "./components/AvailabilityModal/AvailabilityModal.jsx";
import ErrorModal from "../common/ErrorModal/ErrorModal.jsx";
import styles from "./AvailabilityCalendar.module.css";

const AvailabilityCalendar = () => {
  const {selectedCompany, staffMember, isTrainer} = useAuth();
  const companyId = selectedCompany?.id;
  const staffMemberId = staffMember?.id;
  const [searchParams, setSearchParams] = useSearchParams();


  const monthParam = searchParams.get("month");
  const editParam = searchParams.get("edit");
  const dayParam = searchParams.get("day");

  const getInitialDate = useCallback(() => {
    if (monthParam) {
      const [year, month] = monthParam.split("-").map(Number);
      if (year && month && month >= 1 && month <= 12) {
        return new Date(year, month - 1, 1);
      }
    }
    return new Date();
  }, [monthParam]);

  const [currentDate, setCurrentDate] = useState(getInitialDate);
  const [availabilities, setAvailabilities] = useState([]);
  const [classesForTrainer, setClassesForTrainer] = useState([]);
  const [staffMemberData, setStaffMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState(null);

  const formatMonthKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  };

  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (monthParam) {
      const [year, month] = monthParam.split("-").map(Number);
      if (year && month && month >= 1 && month <= 12) {
        const newDate = new Date(year, month - 1, 1);
        if (formatMonthKey(newDate) !== formatMonthKey(currentDate)) {
          setCurrentDate(newDate);
        }
      }
    }
  }, [monthParam]);

  const updateMonth = useCallback(
    (newDate) => {
      setCurrentDate(newDate);
      const newMonthKey = formatMonthKey(newDate);

      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("month", newMonthKey);
        return params;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const openAddModal = useCallback(
    (date) => {
      setSelectedDate(date);
      setSelectedAvailability(null);
      setModalOpen(true);

      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("day", formatDateKey(date));
        params.delete("edit");
        return params;
      }, { replace: true });
    },
    [setSearchParams]
  );

  const closeModal = useCallback(() => {
    setModalOpen(false);
    setSelectedAvailability(null);
    setSelectedDate(null);

    setSearchParams((prev) => {
      const params = new URLSearchParams(prev);
      params.delete("edit");
      params.delete("day");
      return params;
    }, { replace: true });
  }, [setSearchParams]);

  useEffect(() => {
    if (dayParam) {
      const [year, month, day] = dayParam.split('-').map(Number);
      if (year && month && day) {
        setSelectedDate(new Date(year, month - 1, day));
        setSelectedAvailability(null);
        setModalOpen(true);
      }
    } else {
      if (modalOpen) {
        setModalOpen(false);
        setSelectedAvailability(null);
        setSelectedDate(null);
      }
    }
  }, [editParam, dayParam, availabilities]);

  const fetchAvailabilities = useCallback(async () => {
    if (!companyId || !staffMemberId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await staffMemberApi.getAvailability(companyId, staffMemberId);

      const data = response.data;

      setStaffMemberData(data.staffMember || null);
      setAvailabilities(data.availableSlots || []);
    } catch (err) {
      console.error("Error fetching availability:", err);
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [companyId, staffMemberId]);

  const fetchClasses = useCallback(async () => {
    if (!companyId || !staffMemberId) return;
    try {
      setLoading(true);     
      setError(null);

      const response = await staffMemberApi.getEventSchedules(companyId, staffMemberId);

      const data = response.data;
      setClassesForTrainer(data || null);
    } catch (err) {
      console.error("Error fetching classes:", err);
      setError(err.response?.data?.message || err.message);
    }
  }, [companyId, staffMemberId]);

  useEffect(() => {
    fetchAvailabilities();
  }, [fetchAvailabilities]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (!monthParam) {
      const currentMonthKey = formatMonthKey(new Date());
      setSearchParams((prev) => {
        const params = new URLSearchParams(prev);
        params.set("month", currentMonthKey);
        return params;
      }, { replace: true });
    }
  }, []);

  useEffect(() => {
    if (editParam && availabilities.length > 0) {
      const slot = availabilities.find((a) => a.id === editParam);
      if (slot) {
        setSelectedAvailability(slot);
        setSelectedDate(new Date(slot.startTime));
        setModalOpen(true);
      }
    } else if (dayParam && !editParam) {
      const [year, month, day] = dayParam.split("-").map(Number);
      if (year && month && day) {
        setSelectedDate(new Date(year, month - 1, day));
        setSelectedAvailability(null);
        setModalOpen(true);
      }
    } else if (!editParam && !dayParam) {
      if (modalOpen) {
        setModalOpen(false);
        setSelectedAvailability(null);
        setSelectedDate(null);
      }
    }
  }, [editParam, dayParam, availabilities]);

  const availabilitiesByDate = useMemo(() => {
    const grouped = {};

    availabilities.forEach((slot) => {
      if (!slot.startTime) return;

      const dateKey = formatDateKey(new Date(slot.startTime));

      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(slot);
    });

    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => 
        new Date(a.startTime) - new Date(b.startTime)
      );
    });

    return grouped;
  }, [availabilities]);

  const classesByDate = useMemo(() => {
    const grouped = {};

    classesForTrainer.forEach((classItem) => {
      if (!classItem.startTime) return;

      const dateKey = formatDateKey(new Date(classItem.startTime));
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(classItem);
    });

    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => 
        new Date(a.startTime) - new Date(b.startTime)
      );
    });

    return grouped;
  }, [classesForTrainer]);

  const availabilityDates = useMemo(() => Object.keys(availabilitiesByDate), [availabilitiesByDate]);

  const availabilitiesInCurrentMonth = useMemo(() => {
    const currentMonthKey = formatMonthKey(currentDate);

    return availabilityDates
      .filter((date) => date.startsWith(currentMonthKey))
      .reduce((sum, date) => sum + (availabilitiesByDate[date]?.length || 0), 0);
  }, [currentDate, availabilityDates, availabilitiesByDate]);

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
      setSelectedAvailability(null);
      setModalOpen(true);
      return;
    }

    openAddModal(date);
  };

  const handleAvailabilityClick = (availability, e) => {
    e?.stopPropagation();

    if(isTrainer()){
      setSelectedAvailability(availability);
      setSelectedDate(new Date(availability.startTime));
      setModalOpen(true);
      return;
    }

    openEditModal(availability);
  };

  const getSlotsForSelectedDate = () => {
    if (!selectedDate) return [];
    const dateKey = formatDateKey(selectedDate);
    return availabilitiesByDate[dateKey] || [];
  };

  const getClassesForSelectedDate = () => {
    if (!selectedDate) return [];
    const dateKey = formatDateKey(selectedDate);
    return classesByDate[dateKey] || [];
  }

  const handleSaveAvailability = async (formData) => {
    try {
      setError(null);

      const requestData = {
        date: formData.date,
        startTime: formData.startTime,
        endTime: formData.endTime,
      };

      await staffMemberApi.addAvailability(companyId, staffMemberId, requestData);
      await fetchAvailabilities();
      closeModal();
    } catch (err) {
      throw err;
    }
  };

  const handleDeleteAvailability = async (availabilityId) => {
    if (!window.confirm("Are you sure you want to delete this availability slot?")) return;

    try {
      await staffMemberApi.removeAvailability(companyId, availabilityId);
      await fetchAvailabilities();
      closeModal();
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  const clearError = () => setError(null);

  if (loading && availabilities.length === 0) {
    return (
      <div className={styles.calendarLoading}>
        <div className="spinner"></div>
        <p>Loading availabilities...</p>
      </div>
    );
  }

  return (
    <div className={styles.calendar}>
      <ErrorModal error={error} onClose={clearError} title="Availability Error" />

      <AvailabilityHeader
        currentDate={currentDate}
        onPrevMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
        availabilitiesCount={availabilitiesInCurrentMonth}
        totalAvailabilities={availabilities.length}
      />

      <AvailabilityGrid
        currentDate={currentDate}
        availabilitiesByDate={availabilitiesByDate}
        classesByDate={classesByDate}
        onDayClick={handleDayClick}
        onEventClick={handleAvailabilityClick}
      />

      {modalOpen && (
        <AvailabilityModal
          isOpen={modalOpen}
          onClose={closeModal}
          selectedDate={selectedDate}
          selectedAvailability={selectedAvailability}
          slotsForDay={getSlotsForSelectedDate()}
          classesForDay={getClassesForSelectedDate()}
          onSave={handleSaveAvailability}
          onDelete={handleDeleteAvailability}
        />
      )}
    </div>
  );
};

export default AvailabilityCalendar;